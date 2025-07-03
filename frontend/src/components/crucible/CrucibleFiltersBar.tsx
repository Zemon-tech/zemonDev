type Props = {
  search: string;
  setSearch: (s: string) => void;
  difficulty: string;
  setDifficulty: (d: string) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  onClear: () => void;
};

export default function CrucibleFiltersBar({ search, setSearch, difficulty, setDifficulty, tags, setTags, onClear }: Props) {
  // Simulate tag options
  const tagOptions = ['database', 'api', 'scaling', 'security', 'frontend', 'backend'];

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <input
        type="text"
        className="input input-bordered input-md w-48"
        placeholder="Search problems..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <select
        className="select select-bordered select-md w-32"
        value={difficulty}
        onChange={e => setDifficulty(e.target.value)}
      >
        <option value="">All</option>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
        <option value="expert">Expert</option>
      </select>
      {/* Tag popover (simulate multi-select) */}
      <div className="dropdown">
        <label tabIndex={0} className="btn btn-ghost btn-sm border border-base-300">Tags</label>
        <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
          {tagOptions.map((tag: string) => (
            <li key={tag}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tags.includes(tag)}
                  onChange={() => setTags(tags.includes(tag) ? tags.filter((t: string) => t !== tag) : [...tags, tag])}
                  className="checkbox checkbox-xs"
                />
                <span className="capitalize">{tag}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
      {(search || difficulty || tags.length > 0) && (
        <button className="btn btn-xs btn-ghost text-error" onClick={onClear}>✕ Clear</button>
      )}
    </div>
  );
} 