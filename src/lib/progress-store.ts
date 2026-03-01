import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type FirestoreError,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ProgressMap, ProgressStatus } from "@/types/progress";

function isValidStatus(value: unknown): value is ProgressStatus {
  return value === "Solved" || value === "Revision" || value === "Not Attempted";
}

export function subscribeToProgress(
  userId: string,
  onNext: (progress: ProgressMap) => void,
  onError: (error: FirestoreError) => void,
) {
  if (!db) return () => {};

  const progressCollection = collection(db, `users/${userId}/progress`);

  return onSnapshot(
    progressCollection,
    (snapshot) => {
      const map: ProgressMap = {};

      for (const item of snapshot.docs) {
        const status = item.data().status;
        if (!isValidStatus(status)) continue;

        map[item.id] = {
          status,
          updatedAt: item.data().updatedAt?.toDate?.()?.toISOString(),
        };
      }

      onNext(map);
    },
    onError,
  );
}

export async function updateProgress(
  userId: string,
  questionId: string,
  status: ProgressStatus,
) {
  if (!db) return;

  const questionRef = doc(db, `users/${userId}/progress/${questionId}`);
  await setDoc(
    questionRef,
    {
      status,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
