"use client";

import { useEffect, useMemo, useState } from "react";
import { subscribeToProgress, updateProgress } from "@/lib/progress-store";
import type { ProgressMap, ProgressStatus } from "@/types/progress";

type UseProgressParams = {
  userId: string | null;
  questionIds: string[];
  isFirebaseConfigured: boolean;
};

export function useProgress({
  userId,
  questionIds,
  isFirebaseConfigured,
}: UseProgressParams) {
  const [progressMap, setProgressMap] = useState<ProgressMap>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !userId) return;
    return subscribeToProgress(userId, setProgressMap, (snapshotError) =>
      setError(snapshotError.message),
    );
  }, [isFirebaseConfigured, userId]);

  const saveStatus = async (questionId: string, status: ProgressStatus) => {
    setProgressMap((prev) => ({
      ...prev,
      [questionId]: { status, updatedAt: new Date().toISOString() },
    }));

    if (!isFirebaseConfigured || !userId) return;

    setIsSaving(true);
    try {
      await updateProgress(userId, questionId, status);
    } catch (saveError) {
      setError((saveError as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const solvedCount = useMemo(
    () =>
      questionIds.filter((id) => progressMap[id]?.status === "Solved").length,
    [progressMap, questionIds],
  );

  return {
    progressMap,
    saveStatus,
    solvedCount,
    isSaving,
    error,
  };
}
