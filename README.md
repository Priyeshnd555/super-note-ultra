This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

# Project Branch Overview

This repository uses a structured branching model to manage development, testing, and production releases.

## Branches

### 1. `main`

- **Purpose:** Stable production-ready code.
- **Usage:** Only thoroughly tested and approved changes are merged here. This branch represents the live version of the project.

### 2. `qa-testing`

- **Purpose:** Quality Assurance (QA) testing branch.
- **Usage:** Features and fixes that are ready for testing are merged here. The QA team uses this branch to perform integration and system testing before approving for production.

### 3. `sprint-1`

- **Purpose:** Active development for the current sprint.
- **Usage:** All sprint-related work is done here. Once features are completed and reviewed, they are merged into `qa-testing` for testing.

---

### 4. Hotfix Process (Summary)

1. **Naming:** HotFix-date-month-year (Example: HotFix-10-june-2025);
2. **Base Branch:** Always create hotfix branches from `main`.  
3. **Merge:** After the fix, merge into both `main` and `sprint-1`.  
4. **Tag:** Tag the release (Example: git tag -a v1.0.1 -m "Hotfix applied: 10 June 2025").  
5. **Cleanup:** Delete the hotfix branch locally and remotely after merging.

---

## Workflow Summary

- Developers work on feature branches off `sprint-1`.
- Completed features merge into `qa-testing` for QA verification.
- Once QA passes, changes are merged into `main` for release.

---

## Notes

- Regular merges from `main` to `sprint-1` ensure the development branch is up to date.
- Tag releases on the `main` branch using annotated tags for version tracking.
- Each Sprint shoudld not contain more than 4 Features / 4 Sub branches
