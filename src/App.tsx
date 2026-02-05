import { useMemo, useState } from "react";
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function App() {
  const [entries, setEntries] = useState(seedEntries);
  const [draft, setDraft] = useState<Omit<Entry, "id">>({
    title: "",
    amount: 0,
    category: "General",
    date: "2026-03-17",
    type: "expense",
  });

  const totals = useMemo(() => {
    return entries.reduce(
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
  }, [entries]);

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
        <h2>Add an entry</h2>
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
          <span>{entries.length} entries</span>
        </header>
        <div className="entry-list">
          {entries.map((entry) => (
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
    </main>
  );
}
