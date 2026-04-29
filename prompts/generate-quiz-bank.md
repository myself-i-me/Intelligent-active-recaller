# Quiz bank generation prompt

Paste everything below into a fresh Claude chat. Fill in the four bracketed values at the top. Claude will reply with a single JSON object — save it as `whatever.json` and upload it on the app's Home page.

---

You are an expert UPSC question setter. Generate a **quiz bank JSON** for me.

## Inputs (filled in by user)

- **Subject area:** [e.g. Modern Indian History, Indian Polity, Physical Geography]
- **Specific topics or syllabus slice:** [e.g. "Freedom Struggle 1885–1947", or "Articles 12–35 of the Constitution"]
- **Number of quizzes and questions per quiz:** [e.g. "1 quiz of 25 questions" or "3 quizzes of 15 each"]
- **Difficulty mix:** [e.g. "60% medium, 30% hard, 10% easy" — or "UPSC Prelims 2023-equivalent"]

## Output rules — read carefully

1. **Output ONLY a single JSON object** that conforms to the schema below. No prose before or after, no markdown fences, no commentary. Just JSON.
2. **Do not invent facts.** If you are not sure of a fact, omit that question and write a different one. UPSC questions live or die by factual precision.
3. **Question types must be MIXED** within each quiz. Use every type at least once if the quiz has ≥7 questions: `single-correct`, `multi-statement`, `match-the-following`, `assertion-reason`, `chronological`, `statements-count`, `pairs-count`.
4. **Markdown is supported** in `stem`, `statements`, `events`, `pairs`, `options`, `assertion`, `reason`, all `explanation.*` fields. You can use **bold**, italics, tables, lists, inline code, line breaks. Keep it tasteful — UPSC questions are mostly plain prose.
5. **Tables**: when a question genuinely benefits from a tabular display (e.g. comparing dynasties, plans, schemes), set the `table` field as structured data, not as a markdown table inside `stem`.
6. **Images**: leave `image` out unless the user explicitly provides image URLs/paths. Don't invent map URLs.
7. **Every question must have a thorough `explanation`**: a `summary` plus a per-option / per-statement / per-event / per-pair / per-match breakdown. Explain *why each wrong choice is wrong*, not just why the right one is right.
8. **Metadata is mandatory** on every question. Fill `subject`, `topic`, `subtopic`, `concepts` (1–4 items), `difficulty` (`easy` | `medium` | `hard`), `source` (e.g. `"UPSC-style"` or `"UPSC 2018"` if you're modelling on a real PYQ), and 1–4 `tags`.
9. **IDs**: `bank.id`, `quizzes[].id`, `questions[].id` must be unique within the file. Use kebab-case slugs (e.g. `q-history-001`).
10. **Option labels are always uppercase letters** A, B, C, D (sometimes E). Statement / event / pair IDs are integers starting at 1.

## Schema

Top-level shape:

```json
{
  "schemaVersion": "1.0",
  "type": "quiz-bank",
  "bank": {
    "id": "kebab-case-id",
    "title": "Human title",
    "description": "1-2 line description",
    "metadata": { "exam": "UPSC Prelims", "createdAt": "YYYY-MM-DD", "tags": ["..."] }
  },
  "quizzes": [ /* one or more quiz objects */ ]
}
```

Each `quiz`:

```json
{
  "id": "quiz-...",
  "title": "...",
  "description": "...",
  "metadata": {
    "subject": "...",
    "topic": "...",
    "subtopics": ["..."],
    "difficulty": "medium",
    "tags": ["..."]
  },
  "questions": [ /* question objects */ ]
}
```

Each `question` has these common fields plus type-specific fields below: `id`, `type`, `stem`, optional `image`, optional `imageAlt`, optional `table`, `options`, `answer`, `explanation`, `metadata`.

`metadata` (per question):

```json
{
  "subject": "History",
  "topic": "Modern Indian History",
  "subtopic": "Indian National Movement",
  "concepts": ["Non-Cooperation Movement", "Gandhi"],
  "difficulty": "medium",
  "source": "UPSC-style",
  "tags": ["movements", "factual"]
}
```

`table` (optional, for tabular questions):

```json
{ "headers": ["Plan", "Period", "Focus"], "rows": [ ["First", "1951-56", "..."], ["Second", "1956-61", "..."] ] }
```

## Question types — exact shapes

### single-correct

```json
{
  "id": "q-001",
  "type": "single-correct",
  "stem": "Who was the first Indian to become a member of the British Parliament?",
  "options": [
    { "id": "A", "text": "Dadabhai Naoroji" },
    { "id": "B", "text": "Gokhale" },
    { "id": "C", "text": "Banerjee" },
    { "id": "D", "text": "Mehta" }
  ],
  "answer": "A",
  "explanation": {
    "summary": "Dadabhai Naoroji was elected to the British House of Commons from Finsbury Central in 1892.",
    "perOption": {
      "A": "Correct. Elected 1892, hence 'Grand Old Man of India'.",
      "B": "Incorrect. Gokhale sat in the Imperial Legislative Council in India.",
      "C": "Incorrect. Banerjee never sat in the British Parliament.",
      "D": "Incorrect. Mehta presided over INC 1890 but was not a British MP."
    }
  },
  "metadata": { "...": "..." }
}
```

### multi-statement

The stem introduces a list, the `question` field contains the actual ask. Provide `correctStatements` (the integer IDs of statements that are correct).

```json
{
  "id": "q-002",
  "type": "multi-statement",
  "stem": "Consider the following statements regarding the Non-Cooperation Movement:",
  "statements": [
    { "id": 1, "text": "It was launched after the Rowlatt Act and Jallianwala Bagh massacre." },
    { "id": 2, "text": "It called for boycott of British goods, schools, and law courts." },
    { "id": 3, "text": "It was withdrawn after the Chauri Chaura incident." },
    { "id": 4, "text": "Subhas Chandra Bose led it as INC President at the time." }
  ],
  "question": "Which of the statements given above are correct?",
  "options": [
    { "id": "A", "text": "1, 2 and 3 only" },
    { "id": "B", "text": "1, 2 and 4 only" },
    { "id": "C", "text": "2, 3 and 4 only" },
    { "id": "D", "text": "1, 2, 3 and 4" }
  ],
  "answer": "A",
  "correctStatements": [1, 2, 3],
  "explanation": {
    "summary": "Statements 1–3 describe the trigger, programme, and termination correctly. 4 is wrong — Bose became INC President only in 1938.",
    "perStatement": {
      "1": "Correct. Rowlatt Act (1919) and Jallianwala Bagh catalysed the August 1920 launch.",
      "2": "Correct. Boycott of British institutions and goods was the constructive programme.",
      "3": "Correct. Gandhi withdrew in February 1922 after Chauri Chaura.",
      "4": "Incorrect. Bose became INC President only in 1938; C. R. Das led INC affairs in 1920–22."
    }
  },
  "metadata": { "...": "..." }
}
```

### match-the-following

Two lists. Left items are letters (A, B, C, D), right items are integers (1, 2, 3, 4). `correctMatches` maps left → right.

```json
{
  "id": "q-003",
  "type": "match-the-following",
  "stem": "Match List-I (Personality) with List-II (Newspaper) and select the correct answer:",
  "leftList": {
    "title": "List-I (Personality)",
    "items": [
      { "id": "A", "text": "Tilak" },
      { "id": "B", "text": "Lala Lajpat Rai" },
      { "id": "C", "text": "Bipin Chandra Pal" },
      { "id": "D", "text": "Malaviya" }
    ]
  },
  "rightList": {
    "title": "List-II (Newspaper)",
    "items": [
      { "id": 1, "text": "The Punjabee" },
      { "id": 2, "text": "Kesari" },
      { "id": 3, "text": "The Leader" },
      { "id": 4, "text": "New India" }
    ]
  },
  "options": [
    { "id": "A", "text": "A-2, B-1, C-4, D-3" },
    { "id": "B", "text": "A-2, B-4, C-1, D-3" },
    { "id": "C", "text": "A-1, B-2, C-3, D-4" },
    { "id": "D", "text": "A-3, B-1, C-4, D-2" }
  ],
  "answer": "A",
  "correctMatches": { "A": 2, "B": 1, "C": 4, "D": 3 },
  "explanation": {
    "summary": "Tilak — Kesari; Lajpat Rai — The Punjabee; Bipin Chandra Pal — New India; Malaviya — The Leader.",
    "perMatch": {
      "A": "Tilak founded Kesari (Marathi) and Mahratta (English) in 1881.",
      "B": "Lajpat Rai started The Punjabee in 1904.",
      "C": "Bipin Chandra Pal edited New India (Calcutta).",
      "D": "Malaviya founded The Leader at Allahabad in 1909."
    }
  },
  "metadata": { "...": "..." }
}
```

### assertion-reason

Standard four canonical options.

```json
{
  "id": "q-004",
  "type": "assertion-reason",
  "stem": "Read the Assertion (A) and Reason (R) below and select the correct option.",
  "assertion": "The Government of India Act, 1935 introduced provincial autonomy.",
  "reason": "It abolished diarchy at the provincial level and introduced it at the centre.",
  "options": [
    { "id": "A", "text": "Both A and R are true and R is the correct explanation of A." },
    { "id": "B", "text": "Both A and R are true but R is not the correct explanation of A." },
    { "id": "C", "text": "A is true but R is false." },
    { "id": "D", "text": "A is false but R is true." }
  ],
  "answer": "A",
  "explanation": {
    "summary": "Both A and R are correct, and R is precisely the mechanism by which provincial autonomy was achieved.",
    "perOption": {
      "A": "Correct. R is exactly how provincial autonomy was introduced.",
      "B": "Incorrect. R *is* the explanation, not a separate fact.",
      "C": "Incorrect. R is true.",
      "D": "Incorrect. A is true."
    }
  },
  "metadata": { "...": "..." }
}
```

### chronological

Provide `correctOrder` as an array of event IDs in the right sequence.

```json
{
  "id": "q-005",
  "type": "chronological",
  "stem": "Arrange the following events in chronological order (earliest first):",
  "events": [
    { "id": 1, "text": "Partition of Bengal" },
    { "id": 2, "text": "Surat Split" },
    { "id": 3, "text": "Lucknow Pact" },
    { "id": 4, "text": "Rowlatt Act" }
  ],
  "options": [
    { "id": "A", "text": "1 → 2 → 3 → 4" },
    { "id": "B", "text": "2 → 1 → 4 → 3" },
    { "id": "C", "text": "1 → 3 → 2 → 4" },
    { "id": "D", "text": "3 → 1 → 2 → 4" }
  ],
  "answer": "A",
  "correctOrder": [1, 2, 3, 4],
  "explanation": {
    "summary": "Partition of Bengal (1905) → Surat Split (1907) → Lucknow Pact (1916) → Rowlatt Act (1919).",
    "perEvent": {
      "1": "Partition of Bengal — 1905, by Lord Curzon.",
      "2": "Surat Split — 1907, between Moderates and Extremists.",
      "3": "Lucknow Pact — 1916, INC–Muslim League agreement.",
      "4": "Rowlatt Act — 1919."
    }
  },
  "metadata": { "...": "..." }
}
```

### statements-count

"How many of the above statements are correct?" Provide `correctStatements`.

```json
{
  "id": "q-006",
  "type": "statements-count",
  "stem": "Consider the following statements about the Indus Valley Civilisation:",
  "statements": [
    { "id": 1, "text": "The civilisation was largely urban in character." },
    { "id": 2, "text": "Iron tools were widely used." },
    { "id": 3, "text": "The Great Bath was found at Mohenjo-daro." },
    { "id": 4, "text": "The script has been definitively deciphered." }
  ],
  "question": "How many of the above statements are correct?",
  "options": [
    { "id": "A", "text": "Only one" },
    { "id": "B", "text": "Only two" },
    { "id": "C", "text": "Only three" },
    { "id": "D", "text": "All four" }
  ],
  "answer": "B",
  "correctStatements": [1, 3],
  "explanation": {
    "summary": "1 and 3 are correct; 2 is wrong (Bronze Age, no iron); 4 is wrong (script remains undeciphered).",
    "perStatement": {
      "1": "Correct. Planned cities, drainage, granaries.",
      "2": "Incorrect. Bronze, not iron, was the metal of the period.",
      "3": "Correct. The Great Bath is at Mohenjo-daro.",
      "4": "Incorrect. The Indus script remains undeciphered."
    }
  },
  "metadata": { "...": "..." }
}
```

### pairs-count

"How many of the above pairs are correctly matched?" Provide `correctPairs`.

```json
{
  "id": "q-007",
  "type": "pairs-count",
  "stem": "Consider the following pairs of dynasty and capital:",
  "pairs": [
    { "id": 1, "left": "Cholas", "right": "Thanjavur" },
    { "id": 2, "left": "Pallavas", "right": "Madurai" },
    { "id": 3, "left": "Rashtrakutas", "right": "Manyakheta" },
    { "id": 4, "left": "Chalukyas of Badami", "right": "Badami" }
  ],
  "question": "How many of the above pairs are correctly matched?",
  "options": [
    { "id": "A", "text": "Only one" },
    { "id": "B", "text": "Only two" },
    { "id": "C", "text": "Only three" },
    { "id": "D", "text": "All four" }
  ],
  "answer": "C",
  "correctPairs": [1, 3, 4],
  "explanation": {
    "summary": "Pallava capital was Kanchipuram (not Madurai — that was the Pandyas).",
    "perPair": {
      "1": "Correct. Cholas — Thanjavur.",
      "2": "Incorrect. Pallava capital was Kanchipuram; Madurai was the Pandya capital.",
      "3": "Correct. Rashtrakutas — Manyakheta (modern Malkhed).",
      "4": "Correct. Chalukyas of Badami — Badami (Vatapi)."
    }
  },
  "metadata": { "...": "..." }
}
```

### Question with a table

Use `table` for true tabular content. Headers and rows are arrays of plain strings (markdown is allowed inside cells).

```json
{
  "id": "q-008",
  "type": "single-correct",
  "stem": "Refer to the table below showing Five-Year Plans and their primary focus:",
  "table": {
    "headers": ["Plan", "Period", "Primary Focus"],
    "rows": [
      ["First Plan", "1951–56", "Agriculture and irrigation"],
      ["Second Plan", "1956–61", "Heavy industry (Mahalanobis model)"],
      ["Third Plan", "1961–66", "Self-reliance, agriculture and industry"]
    ]
  },
  "question": "Which Five-Year Plan was based on the Mahalanobis model emphasising heavy industry?",
  "options": [
    { "id": "A", "text": "First Plan" },
    { "id": "B", "text": "Second Plan" },
    { "id": "C", "text": "Third Plan" },
    { "id": "D", "text": "Fourth Plan" }
  ],
  "answer": "B",
  "explanation": { "summary": "...", "perOption": { "A": "...", "B": "...", "C": "...", "D": "..." } },
  "metadata": { "...": "..." }
}
```

## Final reminder

Output **only** the JSON object. No preamble, no postscript, no fenced code block, no apologies if you can't think of enough questions — just produce as many high-quality questions as the user asked for, all factually verifiable, all with full explanations and metadata.
