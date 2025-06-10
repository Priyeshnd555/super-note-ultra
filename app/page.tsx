"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, Plus, Check, ArrowRight, Pause, RotateCcw, Trash2, LayoutGrid, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Task {
  id: string
  text: string
  status: "today" | "next" | "hold" | "done"
  created_at: number
  updated_at: number
}

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showKanban, setShowKanban] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; taskId: string } | null>(null)
  const [swipeAction, setSwipeAction] = useState<{ taskId: string; action: string; offset: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks")
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
    // Auto-focus input (Jakob's Law - like messaging apps)
    inputRef.current?.focus()
  }, [])

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks))
  }, [tasks])

  // Track typing state
  useEffect(() => {
    if (newTask.length > 0) {
      setIsTyping(true)
    } else {
      const timer = setTimeout(() => setIsTyping(false), 500)
      return () => clearTimeout(timer)
    }
  }, [newTask])

  // Doherty Threshold: Immediate response under 400ms
  const addTask = useCallback(() => {
    if (!newTask.trim()) return

    const task: Task = {
      id: Date.now().toString(),
      text: newTask.trim(),
      status: "today", // Default to today
      created_at: Date.now(),
      updated_at: Date.now(),
    }

    // Optimistic update - instant feedback
    setTasks((prev) => [task, ...prev])
    setNewTask("")

    // Haptic-like feedback simulation
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }, [newTask])

  // Fitts's Law: Reduce distance by making swipe the primary interaction
  const handleTouchStart = (e: React.TouchEvent, taskId: string) => {
    const touch = e.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY, taskId })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStart.x
    const deltaY = touch.clientY - touchStart.y

    // Only horizontal swipes (prevent scroll interference)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20) {
      e.preventDefault()

      let action = ""
      if (deltaX > 60) action = "complete"
      else if (deltaX < -60) action = "delete"

      setSwipeAction({
        taskId: touchStart.taskId,
        action,
        offset: deltaX,
      })
    }
  }

  const handleTouchEnd = () => {
    if (swipeAction && Math.abs(swipeAction.offset) > 100) {
      if (swipeAction.action === "complete") {
        updateTaskStatus(swipeAction.taskId, "done")
      } else if (swipeAction.action === "delete") {
        deleteTask(swipeAction.taskId)
      }
    }

    setTouchStart(null)
    setSwipeAction(null)
  }

  const updateTaskStatus = (taskId: string, newStatus: Task["status"]) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, status: newStatus, updated_at: Date.now() } : task)),
    )
  }

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId))
  }

  const filteredTasks = tasks.filter((task) => task.text.toLowerCase().includes(searchQuery.toLowerCase()))

  // Von Restorff Effect: Make important tasks stand out
  const getTaskPriority = (task: Task) => {
    const age = Date.now() - task.created_at
    const isOld = age > 24 * 60 * 60 * 1000 // 1 day
    const isUrgent = task.text.toLowerCase().includes("urgent") || task.text.includes("!")
    return { isOld, isUrgent }
  }

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  // WhatsApp-style task card with dark theme
  const TaskCard = ({ task, showActions = true }: { task: Task; showActions?: boolean }) => {
    const { isOld, isUrgent } = getTaskPriority(task)
    const isBeingSwiped = swipeAction?.taskId === task.id
    const swipeOffset = isBeingSwiped ? swipeAction.offset : 0
    const [isHovered, setIsHovered] = useState(false)

    return (
      <Card
        className={`
        relative mb-2 bg-gray-800 border border-gray-700 transition-all duration-200 overflow-hidden rounded-lg
        ${isUrgent ? "border-l-4 border-l-red-500" : ""}
        ${isOld ? "border-l-4 border-l-yellow-500" : ""}
        ${task.status === "done" ? "bg-gray-900 border-gray-800" : ""}
        ${isBeingSwiped ? "shadow-lg shadow-black/20" : isHovered ? "shadow-md shadow-black/10" : ""}
      `}
        style={{
          transform: `translateX(${swipeOffset}px)`,
        }}
        onTouchStart={(e) => handleTouchStart(e, task.id)}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Swipe indicators - Law of Affordances */}
        {isBeingSwiped && (
          <>
            {swipeOffset > 0 && (
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-400">
                <Check className="h-6 w-6" />
              </div>
            )}
            {swipeOffset < 0 && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-400">
                <Trash2 className="h-6 w-6" />
              </div>
            )}
          </>
        )}

        <div className="p-4">
          {/* Simplified view with minimal information */}
          <div className="flex items-center justify-between">
            {/* Task content - minimal by default */}
            <div className="flex-1 min-w-0">
              <p
                className={`
                text-base leading-relaxed text-gray-100
                ${task.status === "done" ? "line-through text-gray-500" : ""}
                ${isUrgent ? "font-medium" : ""}
              `}
              >
                {task.text}
              </p>

              {/* Only show time by default */}
              <p className="text-xs text-gray-400 mt-1">{getTimeAgo(task.created_at)}</p>

              {/* Additional metadata only on hover - Progressive Disclosure */}
              {isHovered && (
                <div className="flex items-center gap-2 mt-2 animate-in fade-in duration-200">
                  {task.status !== "today" && (
                    <Badge
                      variant="secondary"
                      className={`
                      text-xs px-2 py-0.5 border-0
                      ${task.status === "next" ? "bg-purple-900 text-purple-300" : ""}
                      ${task.status === "hold" ? "bg-yellow-900 text-yellow-300" : ""}
                      ${task.status === "done" ? "bg-green-900 text-green-300" : ""}
                    `}
                    >
                      {task.status === "next" && "Next"}
                      {task.status === "hold" && "Hold"}
                      {task.status === "done" && "Done"}
                    </Badge>
                  )}

                  {isUrgent && (
                    <Badge variant="outline" className="text-xs bg-red-900 text-red-300 border-red-700">
                      Urgent
                    </Badge>
                  )}

                  {isOld && (
                    <Badge variant="outline" className="text-xs bg-yellow-900 text-yellow-300 border-yellow-700">
                      Old
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Action buttons - only show on hover for desktop */}
            {showActions && (
              <div
                className={`flex items-center gap-2 flex-shrink-0 ${!isHovered && !isBeingSwiped ? "opacity-0 md:opacity-0" : "opacity-100"} transition-opacity duration-200`}
              >
                {/* Primary action: Mark as done */}
                {task.status !== "done" && (
                  <Button
                    size="sm"
                    className="h-9 w-9 p-0 bg-green-600 hover:bg-green-500 text-white rounded-full shadow-sm"
                    onClick={() => updateTaskStatus(task.id, "done")}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}

                {/* Secondary action: Move to next status */}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 w-9 p-0 border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full"
                  onClick={() => {
                    if (task.status === "today") updateTaskStatus(task.id, "next")
                    else if (task.status === "next") updateTaskStatus(task.id, "hold")
                    else if (task.status === "hold") updateTaskStatus(task.id, "today")
                    else updateTaskStatus(task.id, "today")
                  }}
                >
                  {task.status === "today" && <ArrowRight className="h-4 w-4 text-purple-400" />}
                  {task.status === "next" && <Pause className="h-4 w-4 text-yellow-400" />}
                  {task.status === "hold" && <RotateCcw className="h-4 w-4 text-blue-400" />}
                  {task.status === "done" && <RotateCcw className="h-4 w-4 text-blue-400" />}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    )
  }

  // Miller's Law: 4 main sections (under 7±2)
  const sections = [
    { key: "today" as const, label: "Today", icon: "📅", color: "blue" },
    { key: "next" as const, label: "Next", icon: "⏭️", color: "purple" },
    { key: "hold" as const, label: "Hold", icon: "⏸️", color: "yellow" },
    { key: "done" as const, label: "Done", icon: "✅", color: "green" },
  ]

  // Organize tasks by status for better information architecture
  const tasksByStatus = {
    today: filteredTasks.filter((t) => t.status === "today"),
    next: filteredTasks.filter((t) => t.status === "next"),
    hold: filteredTasks.filter((t) => t.status === "hold"),
    done: filteredTasks.filter((t) => t.status === "done"),
  }

  // WhatsApp-style task creation view with dark theme
  const TaskCreationView = () => (
    <div className="min-h-screen bg-gray-900">
      {/* WhatsApp-style header */}
      <div className="sticky top-0 bg-gray-800 border-b border-gray-700 z-10 shadow-sm">
        <div className="p-4">
          <h1 className="text-xl font-semibold text-center text-gray-100">Tasks</h1>
        </div>
      </div>

      {/* Task list with WhatsApp-style organization */}
      <div className="p-4 pb-32">
        {filteredTasks.filter((t) => t.status === "today" || t.status === "hold").length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-medium text-gray-200 mb-2">Ready to start</h2>
            <p className="text-gray-400">Add your first task below</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Today tasks - No count, no anxiety */}
            {tasksByStatus.today.length > 0 && (
              <div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-lg">📅</span>
                  <h2 className="text-lg font-semibold text-gray-200">Today</h2>
                </div>
                <div className="space-y-0">
                  {tasksByStatus.today.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}

            {/* On Hold tasks - No count */}
            {tasksByStatus.hold.length > 0 && (
              <div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-lg">⏸️</span>
                  <h2 className="text-lg font-semibold text-gray-200">On Hold</h2>
                </div>
                <div className="space-y-0">
                  {tasksByStatus.hold.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Count info at bottom - only when not typing */}
      {!isTyping && (tasksByStatus.next.length > 0 || tasksByStatus.done.length > 0) && (
        <div className="fixed bottom-20 left-0 right-0 z-10">
          <div className="flex justify-center">
            <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-full px-4 py-2 shadow-lg">
              <div className="flex items-center gap-4 text-xs text-gray-300">
                {tasksByStatus.next.length > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>{tasksByStatus.next.length} next</span>
                  </div>
                )}
                {tasksByStatus.done.length > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{tasksByStatus.done.length} done</span>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-auto p-1 text-gray-400 hover:text-gray-200"
                  onClick={() => setShowKanban(true)}
                >
                  view all
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // WhatsApp-style Kanban board view
  const KanbanView = () => (
    <div className="min-h-screen bg-gray-900">
      {/* Header with search */}
      <div className="sticky top-0 bg-gray-800 border-b border-gray-700 z-10 shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base bg-gray-700 border-gray-600 rounded-xl text-gray-100 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Kanban board */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-24">
        {sections.map((section) => {
          const sectionTasks = filteredTasks.filter((t) => t.status === section.key)

          return (
            <div key={section.key} className="bg-gray-800 border border-gray-700 rounded-lg p-3">
              {/* Section header */}
              <div className="flex items-center justify-between mb-3 px-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{section.icon}</span>
                  <h2 className="font-medium text-gray-200">{section.label}</h2>
                  <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
                    {sectionTasks.length}
                  </span>
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                {sectionTasks.length === 0 ? (
                  <div className="text-center py-8 bg-gray-900 rounded-lg border border-dashed border-gray-700">
                    <p className="text-gray-500">No tasks</p>
                  </div>
                ) : (
                  sectionTasks.map((task) => <TaskCard key={task.id} task={task} showActions={false} />)
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Close button */}
      <div className="fixed top-4 right-4 z-20">
        <Button
          size="icon"
          variant="outline"
          className="h-10 w-10 rounded-full bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 shadow-md"
          onClick={() => setShowKanban(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Conditional rendering based on view */}
      {showKanban ? <KanbanView /> : <TaskCreationView />}

      {/* WhatsApp-style Fixed Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4 shadow-lg">
        <div className="flex gap-3 items-center">
          <Input
            ref={inputRef}
            placeholder="Type a task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addTask()}
            className="flex-1 h-12 text-base rounded-full border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400"
          />

          {/* Kanban toggle button */}
          <Button
            onClick={() => setShowKanban(!showKanban)}
            size="lg"
            variant="outline"
            className="h-12 w-12 rounded-full border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-300"
          >
            <LayoutGrid className="h-5 w-5" />
          </Button>

          {/* WhatsApp-style send button */}
          <Button
            onClick={addTask}
            size="lg"
            className="h-12 w-12 rounded-full bg-green-600 hover:bg-green-500 shadow-lg"
            disabled={!newTask.trim()}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </>
  )
}
