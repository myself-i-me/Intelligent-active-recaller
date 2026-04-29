# UPSC Quiz

A plug-and-play study app for UPSC MCQ practice. Upload a single JSON file and the app generates the entire quiz UI — every UPSC question pattern (single correct, multi-statement, match-the-following, assertion-reason, chronological, statements/pairs count) plus tables and images.

After each quiz, download a result file. Upload result files to the **Analytics** page to see weak areas, trends, and topic-level performance over time.

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite (usually http://localhost:5173).

## Build

```bash
npm run build      # outputs to dist/
npm run preview    # serves the dist/ build locally
```

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main`. The workflow in `.github/workflows/deploy.yml` builds and deploys automatically.

`vite.config.ts` uses `base: './'` so the build works under any subpath without hardcoding the repo name.

## File format — quiz bank

A quiz bank is a single JSON file. The schema is documented by the working sample at [sample-quiz-bank.json](sample-quiz-bank.json), which contains one example of every supported question type.

Top level:

```json
{
  "schemaVersion": "1.0",
  "type": "quiz-bank",
  "bank": { "id": "...", "title": "...", "description": "...", "metadata": { ... } },
  "quizzes": [ { "id": "...", "title": "...", "questions": [ ... ] } ]
}
```

### Supported question types

| `type`                | Use for                                                                |
| --------------------- | ---------------------------------------------------------------------- |
| `single-correct`      | Standard four-option MCQ                                               |
| `multi-statement`     | "Which of the statements above is/are correct?"                        |
| `statements-count`    | "How many of the above statements are correct?"                        |
| `match-the-following` | Two lists with options like A-2, B-1, C-4, D-3                         |
| `assertion-reason`    | Standard A/R question with the four canonical options                  |
| `chronological`       | "Arrange in chronological order"                                       |
| `pairs-count`         | "How many of the above pairs are correctly matched?"                   |

### Tables and images per question

- Add a structured `table` object (`{ headers: [...], rows: [[...]] }`) — rendered as an HTML table.
- Add an `image` field — accepts a relative path (e.g. `images/q42.png`, served from the repo's `public/` folder), a full `https://...` URL, or a `data:` URL.
- Markdown is supported in stems, statements, options, and explanations (including inline tables, lists, bold/italic, code).

### Per-question metadata

Every question can carry hidden tags that drive analytics:

```json
"metadata": {
  "subject": "History",
  "topic": "Modern Indian History",
  "subtopic": "Indian National Movement",
  "concepts": ["Non-Cooperation Movement", "Gandhi"],
  "difficulty": "medium",
  "source": "UPSC 2018",
  "tags": ["movements", "factual"]
}
```

These never appear during the quiz. They are aggregated on the Analytics page after you upload result files.

### Per-question explanations

Every question has both an overall summary and a per-option / per-statement / per-event / per-pair / per-match breakdown explaining why each is right or wrong.

## File format — quiz result

After a quiz, the app produces a result file:

```json
{
  "schemaVersion": "1.0",
  "type": "quiz-result",
  "completedAt": "2026-04-28T10:30:00Z",
  "bank":  { "id": "...", "title": "..." },
  "quiz":  { "id": "...", "title": "...", "metadata": { ... } },
  "score": { "correct": 18, "incorrect": 5, "skipped": 2, "total": 25, "percentage": 72 },
  "questions": [
    {
      "questionId": "q-002",
      "type": "multi-statement",
      "stem": "...",
      "userAnswer": "C",
      "correctAnswer": "A",
      "isCorrect": false,
      "metadata": { ... }
    }
  ]
}
```

Question metadata is copied into the result file, so the Analytics page works on result files alone — you don't need to keep the original quiz bank around.

## Generating quiz banks with Claude

Open `sample-quiz-bank.json`, hand it to Claude, and ask it to write a new bank in the same format. The schema is documented entirely by example.

## Project layout

```
src/
  AppContext.tsx        # global state (active bank, session, last result)
  App.tsx               # router + provider
  main.tsx              # entry
  index.css             # Tailwind
  components/
    Layout.tsx          # header + nav
    Markdown.tsx        # markdown renderer (with GFM tables)
    QuestionView.tsx    # the quiz answering UI
    QuestionBody.tsx    # type-specific body (statements/lists/A&R/...)
    QuestionTable.tsx   # structured table renderer
    QuestionImage.tsx   # image renderer (relative / URL / data: URL)
    ExplanationPanel.tsx
    FileUpload.tsx
  data/
    sampleBank.json     # default bank shipped with the app
    sampleBank.ts       # typed import wrapper
  lib/
    types.ts            # full schema types
    grading.ts
    shuffle.ts
    session.ts          # build a new quiz session
    results.ts          # build + download result files
    analytics.ts        # aggregate result files into stats
    validate.ts         # shape checks for uploaded files
    storage.ts          # localStorage wrappers
  routes/
    Home.tsx
    Quiz.tsx
    Results.tsx
    Review.tsx
    Analytics.tsx
public/
  sample-quiz-bank.json # downloadable template (linked from Home)
.github/workflows/
  deploy.yml            # GitHub Pages build + deploy
```
