import type { Difficulty, Question } from "@/types/question";

export type DifficultySort = "easy-to-hard" | "hard-to-easy";

export const DIFFICULTY_ORDER: Record<Difficulty, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
};

export function sortByDifficulty(questions: Question[], sort: DifficultySort): Question[] {
  return [...questions].sort((a, b) => {
    const diff = DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
    if (diff === 0) return a.title.localeCompare(b.title);
    return sort === "easy-to-hard" ? diff : -diff;
  });
}
