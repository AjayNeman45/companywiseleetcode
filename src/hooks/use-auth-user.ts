"use client";

import type { FirebaseError } from "firebase/app";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { auth, isFirebaseConfigured } from "@/lib/firebase";

type UseAuthUserResult = {
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isFirebaseConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
};

export function useAuthUser(): UseAuthUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(isFirebaseConfigured && auth));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth) return;

    setError(null);
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
    } catch (authError) {
      const firebaseError = authError as FirebaseError;
      if (firebaseError.code === "auth/configuration-not-found") {
        setError(
          "Firebase Auth is not fully configured. Enable Google sign-in and add localhost to authorized domains in Firebase Console.",
        );
        return;
      }

      if (firebaseError.code === "auth/popup-closed-by-user") return;

      setError(firebaseError.message);
    }
  };

  const signOutUser = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  return {
    userId: user?.uid ?? null,
    userName: user?.displayName ?? null,
    userEmail: user?.email ?? null,
    isAuthenticated: Boolean(user),
    isLoading,
    error,
    isFirebaseConfigured,
    signInWithGoogle,
    signOutUser,
  };
}
