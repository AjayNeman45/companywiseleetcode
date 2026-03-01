import type { ProgressMap } from "@/types/progress";

type ProgressOverviewProps = {
  totalQuestions: number;
  progressMap: ProgressMap;
};

export function ProgressOverview({ totalQuestions, progressMap }: ProgressOverviewProps) {
  const solved = Object.values(progressMap).filter((item) => item.status === "Solved").length;
  const revision = Object.values(progressMap).filter((item) => item.status === "Revision").length;
  const attempted = Object.keys(progressMap).length;
  const notAttempted = Math.max(totalQuestions - attempted, 0);
  const progressPercent = totalQuestions === 0 ? 0 : Math.round((solved / totalQuestions) * 100);

  const stats = [
    { label: "Total", value: totalQuestions.toString() },
    { label: "Solved", value: solved.toString() },
    { label: "Revision", value: revision.toString() },
    { label: "Not Attempted", value: notAttempted.toString() },
    { label: "Progress", value: `${progressPercent}%` },
  ];

  return (
    <section className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-4 shadow-sm backdrop-blur-sm">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat, index) => (
          <div key={stat.label} className="rounded-xl border border-slate-700 bg-slate-950/70 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-400">{stat.label}</p>
            <p className={`mt-1 text-xl font-semibold ${index === 1 ? "text-emerald-300" : "text-slate-100"}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
