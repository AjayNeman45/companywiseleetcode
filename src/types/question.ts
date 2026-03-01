export type Difficulty = "Easy" | "Medium" | "Hard";

export type Question = {
  id: string;
  title: string;
  link: string;
  difficulty: Difficulty;
  topics: string[];
  companies: string[];
};
