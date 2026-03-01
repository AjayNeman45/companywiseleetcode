"use client";

import { useMemo, useState } from "react";
import { FiltersBar } from "@/components/filters-bar";
import { ProgressOverview } from "@/components/progress-overview";
import { QuestionTable } from "@/components/question-table";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useProgress } from "@/hooks/use-progress";
import { sortByDifficulty, type DifficultySort } from "@/lib/questions";
import type { Difficulty, Question } from "@/types/question";

type DashboardClientProps = {
  questions: Question[];
};

type DifficultyFilter = Difficulty | "All";

export function DashboardClient({ questions }: DashboardClientProps) {
  const [searchText, setSearchText] = useState<string>("");
  const [selectedCompany, setSelectedCompany] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyFilter>("All");
  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [sortDirection, setSortDirection] = useState<DifficultySort>("easy-to-hard");

  const {
    userId,
    userName,
    userEmail,
    isAuthenticated,
    isLoading: isAuthLoading,
    error: authError,
    isFirebaseConfigured,
    signInWithGoogle,
    signOutUser,
  } = useAuthUser();
  const { progressMap, saveStatus, solvedCount, isSaving, error: progressError } = useProgress({
    userId,
    questionIds: questions.map((question) => question.id),
    isFirebaseConfigured,
  });

  const companies = useMemo(
    () =>
      Array.from(new Set(questions.flatMap((question) => question.companies))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [questions],
  );

  const topics = useMemo(
    () =>
      Array.from(new Set(questions.flatMap((question) => question.topics))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [questions],
  );

  const filteredQuestions = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    const filtered = questions.filter((question) => {
      const matchesSearch = !search || question.title.toLowerCase().includes(search);
      const matchesCompany =
        selectedCompany === "All" || question.companies.includes(selectedCompany);
      const matchesDifficulty =
        selectedDifficulty === "All" || question.difficulty === selectedDifficulty;
      const matchesTopic = selectedTopic === "All" || question.topics.includes(selectedTopic);

      return matchesSearch && matchesCompany && matchesDifficulty && matchesTopic;
    });

    return sortByDifficulty(filtered, sortDirection);
  }, [questions, searchText, selectedCompany, selectedDifficulty, selectedTopic, sortDirection]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
      <header className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-5 shadow-xl shadow-black/20 backdrop-blur-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
          Company-wise LeetCode Tracker
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-100">Question Dashboard</h1>
        <p className="mt-2 text-slate-300">
          Unique questions: <span className="font-semibold">{questions.length}</span> | Solved:{" "}
          <span className="font-semibold">{solvedCount}</span> | Visible after filters:{" "}
          <span className="font-semibold">{filteredQuestions.length}</span>
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {!isAuthenticated ? (
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={!isFirebaseConfigured || isAuthLoading}
              className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-600"
            >
              Sign in with Google
            </button>
          ) : (
            <button
              type="button"
              onClick={signOutUser}
              className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              Sign out
            </button>
          )}
          {isAuthenticated ? (
            <p className="text-sm text-slate-300">
              Signed in as <span className="font-medium text-slate-100">{userName ?? userEmail ?? "User"}</span>
            </p>
          ) : null}
        </div>
        {!isFirebaseConfigured ? (
          <p className="mt-2 text-sm text-amber-300">
            Firebase is not configured. Add env vars to enable Google sign-in and cloud progress.
          </p>
        ) : null}
        {isAuthLoading ? <p className="mt-2 text-sm text-slate-400">Checking sign-in session...</p> : null}
        {isSaving ? <p className="mt-2 text-sm text-slate-400">Saving progress...</p> : null}
        {authError ? <p className="mt-2 text-sm text-rose-300">Auth error: {authError}</p> : null}
        {progressError ? <p className="mt-2 text-sm text-rose-300">Progress error: {progressError}</p> : null}
      </header>

      <ProgressOverview totalQuestions={questions.length} progressMap={progressMap} />

      <FiltersBar
        searchText={searchText}
        selectedCompany={selectedCompany}
        selectedDifficulty={selectedDifficulty}
        selectedTopic={selectedTopic}
        sortDirection={sortDirection}
        companies={companies}
        topics={topics}
        onSearchTextChange={setSearchText}
        onCompanyChange={setSelectedCompany}
        onDifficultyChange={setSelectedDifficulty}
        onTopicChange={setSelectedTopic}
        onSortDirectionChange={setSortDirection}
      />

      <QuestionTable questions={filteredQuestions} progressMap={progressMap} onStatusChange={saveStatus} />
    </main>
  );
}
