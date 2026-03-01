import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";

type Difficulty = "Easy" | "Medium" | "Hard";

type QuestionRecord = {
  id: string;
  title: string;
  link: string;
  difficulty: Difficulty;
  topics: string[];
  companies: string[];
};

type CsvRow = Record<string, string | undefined>;

const ROOT_DIR = process.cwd();
const OUTPUT_FILE = path.join(ROOT_DIR, "data", "questions.ts");
const REPO_DATA_ROOT = path.join(ROOT_DIR, "repodata", "interview-company-wise-problems");
const FALLBACK_DATA_ROOT = path.join(ROOT_DIR, "interview-company-wise-problems");
const IGNORED_DIRS = new Set([
  ".git",
  ".next",
  "node_modules",
  "public",
  "src",
  "scripts",
  "data",
]);

const DIFFICULTY_RANK: Record<Difficulty, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
};

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeUrl(value: string): string {
  return value.toLowerCase().trim().replace(/\/+$/, "");
}

function normalizeDifficulty(value: string): Difficulty {
  const lower = value.toLowerCase().trim();

  if (lower.startsWith("e")) return "Easy";
  if (lower.startsWith("h")) return "Hard";

  return "Medium";
}

function parseTopics(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(/[|,;/]/g)
        .map((topic) => topic.trim())
        .filter(Boolean),
    ),
  );
}

function prettifyCompanyName(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function makeQuestionId(title: string, link: string): string {
  const source = link.trim() || title.trim();
  return createHash("sha1").update(source).digest("hex").slice(0, 12);
}

function normalizeHeaders(row: CsvRow): CsvRow {
  const normalized: CsvRow = {};

  for (const [rawKey, value] of Object.entries(row)) {
    const key = rawKey.toLowerCase().replace(/[\s_-]+/g, "");
    normalized[key] = value;
  }

  return normalized;
}

function pickField(row: CsvRow, keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (value && value.trim()) return value.trim();
  }

  return "";
}

async function collectCsvFiles(dir: string): Promise<string[]> {
  const output: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      const nested = await collectCsvFiles(fullPath);
      output.push(...nested);
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith(".csv")) {
      output.push(fullPath);
    }
  }

  return output;
}

function mergeQuestion(base: QuestionRecord, incoming: QuestionRecord): QuestionRecord {
  const mergedDifficulty =
    DIFFICULTY_RANK[incoming.difficulty] > DIFFICULTY_RANK[base.difficulty]
      ? incoming.difficulty
      : base.difficulty;

  const mergedTopics = Array.from(new Set([...base.topics, ...incoming.topics])).sort(
    (a, b) => a.localeCompare(b),
  );
  const mergedCompanies = Array.from(
    new Set([...base.companies, ...incoming.companies]),
  ).sort((a, b) => a.localeCompare(b));

  return {
    ...base,
    title: base.title.length >= incoming.title.length ? base.title : incoming.title,
    link: base.link.startsWith("http") ? base.link : incoming.link,
    difficulty: mergedDifficulty,
    topics: mergedTopics,
    companies: mergedCompanies,
  };
}

async function main() {
  const sourceRoot = (
    await fs
      .access(REPO_DATA_ROOT)
      .then(() => REPO_DATA_ROOT)
      .catch(async () =>
        fs
          .access(FALLBACK_DATA_ROOT)
          .then(() => FALLBACK_DATA_ROOT)
          .catch(() => ROOT_DIR),
      )
  ) as string;

  const csvFiles = await collectCsvFiles(sourceRoot);

  const byId = new Map<string, QuestionRecord>();
  const titleIndex = new Map<string, string>();
  const linkIndex = new Map<string, string>();

  for (const csvFile of csvFiles) {
    const relativePath = path.relative(sourceRoot, csvFile);
    const pathParts = relativePath.split(path.sep);
    const companyName = prettifyCompanyName(pathParts[0] ?? "Unknown");

    const fileContents = await fs.readFile(csvFile, "utf8");
    const rows = parse(fileContents, {
      bom: true,
      columns: true,
      relax_column_count: true,
      skip_empty_lines: true,
      trim: true,
    }) as CsvRow[];

    for (const rawRow of rows) {
      const row = normalizeHeaders(rawRow);
      const title = pickField(row, [
        "title",
        "question",
        "problem",
        "problemname",
        "name",
      ]);
      const link = pickField(row, ["link", "url", "problemlink", "questionlink"]);
      const difficultyRaw = pickField(row, ["difficulty", "level"]);
      const topicsRaw = pickField(row, ["topics", "topic", "tags", "tag"]);

      if (!title && !link) continue;

      const normalizedTitle = normalizeText(title || link);
      const normalizedLink = normalizeUrl(link);

      const incoming: QuestionRecord = {
        id: makeQuestionId(title || normalizedLink, link),
        title: title || link,
        link,
        difficulty: normalizeDifficulty(difficultyRaw),
        topics: parseTopics(topicsRaw),
        companies: [companyName],
      };

      const existingIdFromTitle = normalizedTitle ? titleIndex.get(normalizedTitle) : undefined;
      const existingIdFromLink = normalizedLink ? linkIndex.get(normalizedLink) : undefined;
      const existingId = existingIdFromLink ?? existingIdFromTitle;

      if (!existingId) {
        byId.set(incoming.id, incoming);
        if (normalizedTitle) titleIndex.set(normalizedTitle, incoming.id);
        if (normalizedLink) linkIndex.set(normalizedLink, incoming.id);
        continue;
      }

      const current = byId.get(existingId);
      if (!current) continue;

      const merged = mergeQuestion(current, incoming);
      byId.set(existingId, merged);

      if (normalizedTitle) titleIndex.set(normalizedTitle, existingId);
      if (normalizedLink) linkIndex.set(normalizedLink, existingId);
    }
  }

  const questions = Array.from(byId.values()).sort((a, b) => a.title.localeCompare(b.title));

  const fileContent = `// This file is auto-generated by scripts/generate-questions.ts
import type { Question } from "@/types/question";

export const questions: Question[] = ${JSON.stringify(questions, null, 2)};
`;

  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fs.writeFile(OUTPUT_FILE, fileContent, "utf8");

  console.log(
    `Generated ${questions.length} unique questions from ${csvFiles.length} CSV file(s) under ${path.relative(ROOT_DIR, sourceRoot) || "."}.`,
  );
}

main().catch((error) => {
  console.error("Failed to generate questions.ts", error);
  process.exitCode = 1;
});
