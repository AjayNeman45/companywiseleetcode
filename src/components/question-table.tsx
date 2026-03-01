import type { Question } from "@/types/question";
import type { ProgressMap, ProgressStatus } from "@/types/progress";

type QuestionTableProps = {
  questions: Question[];
  progressMap: ProgressMap;
  onStatusChange: (questionId: string, status: ProgressStatus) => void;
};

const DIFFICULTY_STYLE: Record<Question["difficulty"], string> = {
  Easy: "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40",
  Medium: "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40",
  Hard: "bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40",
};

export function QuestionTable({ questions, progressMap, onStatusChange }: QuestionTableProps) {
  return (
    <section className="rounded-2xl border border-slate-700/70 bg-slate-900/80 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-slate-950/70 text-slate-300">
            <tr>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Difficulty</th>
              <th className="px-4 py-3 font-semibold">Topics</th>
              <th className="px-4 py-3 font-semibold">Companies</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {questions.map((question) => (
              <tr key={question.id} className="hover:bg-slate-800/50">
                <td className="max-w-md px-4 py-3">
                  {question.link ? (
                    <a
                      className="font-medium text-sky-300 hover:text-sky-200 hover:underline"
                      href={question.link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {question.title}
                    </a>
                  ) : (
                    <span className="font-medium text-slate-100">{question.title}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${DIFFICULTY_STYLE[question.difficulty]}`}
                  >
                    {question.difficulty}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300">{question.topics.join(", ") || "-"}</td>
                <td className="px-4 py-3 text-slate-300">{question.companies.join(", ")}</td>
                <td className="px-4 py-3">
                  <select
                    value={progressMap[question.id]?.status ?? "Not Attempted"}
                    onChange={(event) =>
                      onStatusChange(question.id, event.target.value as ProgressStatus)
                    }
                    className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-1.5 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-900"
                  >
                    <option value="Not Attempted">Not Attempted</option>
                    <option value="Revision">Revision</option>
                    <option value="Solved">Solved</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {questions.length === 0 ? (
        <p className="p-6 text-center text-sm text-slate-400">
          No questions match your current filters.
        </p>
      ) : null}
    </section>
  );
}
