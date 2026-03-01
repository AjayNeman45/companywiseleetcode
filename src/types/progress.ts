export type ProgressStatus = "Solved" | "Revision" | "Not Attempted";

export type QuestionProgress = {
  status: ProgressStatus;
  updatedAt?: string;
};

export type ProgressMap = Record<string, QuestionProgress>;
