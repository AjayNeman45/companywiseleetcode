# Company-wise LeetCode Tracker

Next.js (App Router + TypeScript) app that:
- Parses all CSV files from all company folders.
- Deduplicates questions globally by title or link.
- Merges repeated questions with `companies: string[]`.
- Stores processed unique questions in `data/questions.ts`.
- Tracks progress (`Solved | Revision | Not Attempted`) in Firebase Firestore.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Firebase Auth (anonymous) + Firestore

## Expected CSV Layout

Repository format (preferred):

```
/repodata
  /interview-company-wise-problems
    /CompanyName
      file1.csv
      file2.csv
    /AnotherCompany
      questions.csv
```

Fallback supported:
```
/interview-company-wise-problems/[CompanyName]/*.csv
```

Supported CSV headers are flexible. Common aliases are handled:
- Title: `title`, `question`, `problem`, `name`
- Link: `link`, `url`, `problemLink`
- Difficulty: `difficulty`, `level`
- Topics: `topics`, `topic`, `tags`

## Install

```bash
npm install
```

## Generate Questions

```bash
npm run generate:questions
```

This script:
- Recursively finds all `.csv` files in company folders.
- Ignores `.git`, `.next`, `node_modules`, `src`, `data`, `scripts`, `public`.
- Deduplicates globally by normalized title or link.
- Merges company names and topics.
- Writes `data/questions.ts`.

`generate:questions` runs automatically before `npm run dev` and `npm run build`.

## Firebase Setup

1. Create a Firebase project.
2. Enable `Authentication > Anonymous`.
3. Enable `Firestore Database` (production or test mode as needed).
4. Copy `.env.example` to `.env.local` and set values.

```bash
copy .env.example .env.local
```

Firestore document shape used by the app:

```
users/{userId}/progress/{questionId}
{
  status: "Solved" | "Revision" | "Not Attempted",
  updatedAt: server timestamp
}
```

## Run

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Build (Production)

```bash
npm run build
npm run start
```

## Project Structure

```
data/
  questions.ts                # generated unique question dataset
scripts/
  generate-questions.ts       # CSV parser + dedupe pipeline
src/
  app/
    page.tsx                  # server entry, renders dashboard
  components/
    dashboard-client.tsx      # filters + table + state orchestration
    filters-bar.tsx
    progress-overview.tsx
    question-table.tsx
  hooks/
    use-auth-user.ts
    use-progress.ts
  lib/
    firebase.ts
    progress-store.ts
    questions.ts
  types/
    progress.ts
    question.ts
```
