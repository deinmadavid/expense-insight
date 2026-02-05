import { useEffect, useMemo, useState } from "react";
import "./tracker.css";

type EntryType = "income" | "expense";

type Entry = {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: EntryType;
};

const seedEntries: Entry[] = [
  {
    id: "e-1",
    title: "Client payout",
    amount: 480000,
    category: "Freelance",
    date: "2026-03-03",
    type: "income",
  },
  {
    id: "e-2",
    title: "Design subscription",
    amount: 18000,
    category: "Tools",
    date: "2026-03-06",
    type: "expense",
  },
  {
    id: "e-3",
    title: "Transport",
    amount: 9500,
    category: "Travel",
    date: "2026-03-07",
    type: "expense",
  },
];

const storageKey = "expense-insight-entries";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function App() {
  const [entries, setEntries] = useState<Entry[]>(() => {
    const stored = localStorage.getItem(storageKey);
    return stored ? (JSON.parse(stored) as Entry[]) : seedEntries;
  });
  const [draft, setDraft] = useState<Omit<Entry, "id">>({
    title: "",
    amount: 0,
    category: "General",
    date: "2026-03-17",
    type: "expense",
  });
  const [monthFilter, setMonthFilter] = useState("2026-03");

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(entries));
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => entry.date.startsWith(monthFilter));
  }, [entries, monthFilter]);

  const totals = useMemo(() => {
    return filteredEntries.reduce(
      (summary, entry) => {
        if (entry.type === "income") {
          summary.income += entry.amount;
        } else {
          summary.expense += entry.amount;
        }

        return summary;
      },
      { income: 0, expense: 0 },
    );
  }, [filteredEntries]);

  const categorySpend = useMemo(() => {
    return filteredEntries
      .filter((entry) => entry.type === "expense")
      .reduce<Record<string, number>>((summary, entry) => {
        summary[entry.category] = (summary[entry.category] ?? 0) + entry.amount;
        return summary;
      }, {});
  }, [filteredEntries]);

  function addEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft.title.trim() || draft.amount <= 0) {
      return;
    }

    setEntries((current) => [
      {
        id: crypto.randomUUID(),
        ...draft,
        title: draft.title.trim(),
      },
      ...current,
    ]);

    setDraft((current) => ({
      ...current,
      title: "",
      amount: 0,
      category: "General",
      type: "expense",
    }));
  }

  function exportCsv() {
    const lines = [
      ["title", "amount", "category", "date", "type"].join(","),
      ...filteredEntries.map((entry) =>
        [entry.title, entry.amount, entry.category, entry.date, entry.type]
          .map((value) => `"${String(value).replaceAll("\"", "\"\"")}"`)
          .join(","),
      ),
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `expense-insight-${monthFilter}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="tracker-page">
      <section className="hero">
        <div>
          <p className="eyebrow">Expense Insight</p>
          <h1>Track personal and freelance cash flow in one place.</h1>
          <p className="description">
            Log income, monitor spending, and keep a clean running balance with
            simple monthly tracking.
          </p>
        </div>
        <div className="summary-grid">
          <article>
            <span>Income</span>
            <strong>{formatCurrency(totals.income)}</strong>
          </article>
          <article>
            <span>Expenses</span>
            <strong>{formatCurrency(totals.expense)}</strong>
          </article>
          <article>
            <span>Balance</span>
            <strong>{formatCurrency(totals.income - totals.expense)}</strong>
          </article>
        </div>
      </section>

      <section className="composer-card">
        <div className="section-header">
          <h2>Add an entry</h2>
          <div className="action-row">
            <input
              type="month"
              value={monthFilter}
              onChange={(event) => setMonthFilter(event.target.value)}
            />
            <button type="button" className="ghost-button" onClick={exportCsv}>
              Export CSV
            </button>
          </div>
        </div>
        <form className="entry-form" onSubmit={addEntry}>
          <input
            placeholder="What was this for?"
            value={draft.title}
            onChange={(event) =>
              setDraft((current) => ({ ...current, title: event.target.value }))
            }
          />
          <div className="form-row">
            <input
              type="number"
              placeholder="Amount"
              value={draft.amount || ""}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  amount: Number(event.target.value),
                }))
              }
            />
            <input
              placeholder="Category"
              value={draft.category}
              onChange={(event) =>
                setDraft((current) => ({ ...current, category: event.target.value }))
              }
            />
            <input
              type="date"
              value={draft.date}
              onChange={(event) =>
                setDraft((current) => ({ ...current, date: event.target.value }))
              }
            />
            <select
              value={draft.type}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  type: event.target.value as EntryType,
                }))
              }
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <button type="submit">Save entry</button>
        </form>
      </section>

      <section className="ledger-card">
        <header>
          <h2>Recent activity</h2>
          <span>{filteredEntries.length} entries</span>
        </header>
        <div className="entry-list">
          {filteredEntries.map((entry) => (
            <article key={entry.id} className="entry-row">
              <div>
                <h3>{entry.title}</h3>
                <p>
                  {entry.category} • {entry.date}
                </p>
              </div>
              <strong className={entry.type === "income" ? "income" : "expense"}>
                {entry.type === "income" ? "+" : "-"}
                {formatCurrency(entry.amount)}
              </strong>
            </article>
          ))}
        </div>
      </section>

      <section className="analytics-card">
        <header>
          <h2>Category spend</h2>
          <span>{monthFilter}</span>
        </header>
        <div className="chart-stack">
          {Object.entries(categorySpend).map(([category, amount]) => (
            <article key={category} className="chart-row">
              <div className="chart-labels">
                <span>{category}</span>
                <strong>{formatCurrency(amount)}</strong>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    width: `${Math.max((amount / Math.max(totals.expense, 1)) * 100, 8)}%`,
                  }}
                />
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
