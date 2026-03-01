import type { Difficulty } from "@/types/question";

type DifficultyFilter = Difficulty | "All";
type SortDirection = "easy-to-hard" | "hard-to-easy";

type FiltersBarProps = {
  searchText: string;
  selectedCompany: string;
  selectedDifficulty: DifficultyFilter;
  selectedTopic: string;
  sortDirection: SortDirection;
  companies: string[];
  topics: string[];
  onSearchTextChange: (value: string) => void;
  onCompanyChange: (value: string) => void;
  onDifficultyChange: (value: DifficultyFilter) => void;
  onTopicChange: (value: string) => void;
  onSortDirectionChange: (value: SortDirection) => void;
};

function selectClassName() {
  return "rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-900";
}

export function FiltersBar({
  searchText,
  selectedCompany,
  selectedDifficulty,
  selectedTopic,
  sortDirection,
  companies,
  topics,
  onSearchTextChange,
  onCompanyChange,
  onDifficultyChange,
  onTopicChange,
  onSortDirectionChange,
}: FiltersBarProps) {
  return (
    <section className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-4 shadow-sm backdrop-blur-sm">
      <div className="grid gap-3 lg:grid-cols-5">
        <input
          value={searchText}
          onChange={(event) => onSearchTextChange(event.target.value)}
          placeholder="Search by title..."
          className={`${selectClassName()} lg:col-span-2`}
        />

        <select
          value={selectedCompany}
          onChange={(event) => onCompanyChange(event.target.value)}
          className={selectClassName()}
        >
          <option value="All">All Companies</option>
          {companies.map((company) => (
            <option key={company} value={company}>
              {company}
            </option>
          ))}
        </select>

        <select
          value={selectedDifficulty}
          onChange={(event) => onDifficultyChange(event.target.value as DifficultyFilter)}
          className={selectClassName()}
        >
          <option value="All">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <select
          value={selectedTopic}
          onChange={(event) => onTopicChange(event.target.value)}
          className={selectClassName()}
        >
          <option value="All">All Topics</option>
          {topics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        <select
          value={sortDirection}
          onChange={(event) =>
            onSortDirectionChange(event.target.value as "easy-to-hard" | "hard-to-easy")
          }
          className={selectClassName()}
        >
          <option value="easy-to-hard">Sort: Easy to Hard</option>
          <option value="hard-to-easy">Sort: Hard to Easy</option>
        </select>
      </div>
    </section>
  );
}
