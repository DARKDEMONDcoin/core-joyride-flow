/** @doc Scheduled Tasks — runs/scheduled tabs with a full new-schedule sheet. */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  ChevronRight,
  ChevronLeft,
  ChevronsUpDown,
  Search,
  X,
  Trash2,
  Zap,
} from "lucide-react";
import { goBackOr } from "@/lib/navigation";

type Repeat = "hourly" | "daily" | "weekly" | "monthly";

interface Task {
  id: string;
  title: string;
  prompt: string;
  repeat: Repeat;
  time: string;
  neverEnds: boolean;
  skipConfirmations: boolean;
  runOption: string;
  agent: string;
  createdAt: number;
  lastRun?: number;
}

const KEY = "megsy.scheduledTasks.v1";
const load = (): Task[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
};
const persist = (t: Task[]) => localStorage.setItem(KEY, JSON.stringify(t));

const REPEATS: Repeat[] = ["hourly", "daily", "weekly", "monthly"];
const AGENTS = ["Megsy 1.6 Lite", "Megsy 1.6", "Megsy Pro"];
const RUN_OPTIONS = ["Same task", "New task"];

export default function ScheduledTasksPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"runs" | "scheduled">("runs");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [repeat, setRepeat] = useState<Repeat>("daily");
  const [time, setTime] = useState("08:00");
  const [neverEnds, setNeverEnds] = useState(true);
  const [skipConfirmations, setSkipConfirmations] = useState(false);
  const [runOption, setRunOption] = useState(RUN_OPTIONS[0]);
  const [agent, setAgent] = useState(AGENTS[0]);

  useEffect(() => setTasks(load()), []);

  const runs = useMemo(() => tasks.filter((t) => t.lastRun), [tasks]);
  const list = tab === "runs" ? runs : tasks;

  const reset = () => {
    setTitle("");
    setPrompt("");
    setRepeat("daily");
    setTime("08:00");
    setNeverEnds(true);
    setSkipConfirmations(false);
    setRunOption(RUN_OPTIONS[0]);
    setAgent(AGENTS[0]);
  };

  const saveTask = () => {
    if (!title.trim() && !prompt.trim()) return;
    const next = [
      ...tasks,
      {
        id: crypto.randomUUID(),
        title: title.trim() || prompt.trim().slice(0, 40),
        prompt: prompt.trim(),
        repeat,
        time,
        neverEnds,
        skipConfirmations,
        runOption,
        agent,
        createdAt: Date.now(),
      },
    ];
    setTasks(next);
    persist(next);
    setOpen(false);
    setTab("scheduled");
    reset();
  };

  const remove = (id: string) => {
    const next = tasks.filter((t) => t.id !== id);
    setTasks(next);
    persist(next);
  };

  return (
    <div className="st-root" dir="ltr">
      <style>{stCss}</style>
      <div className="st-screen">
        <header className="st-top">
          <button type="button" className="st-iconbtn" aria-label="Back" onClick={() => goBackOr(navigate, "/settings")}>
            <ChevronLeft className="w-5 h-5" strokeWidth={2} />
          </button>
          <h1 className="st-title">Scheduled tasks</h1>
          <button type="button" className="st-iconbtn" aria-label="New schedule" onClick={() => setOpen(true)}>
            <Plus className="w-5 h-5" strokeWidth={2} />
          </button>
        </header>

        <div className="st-tabs" role="tablist">
          {(["runs", "scheduled"] as const).map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={tab === k}
              className={`st-tab ${tab === k ? "is-active" : ""}`}
              onClick={() => setTab(k)}
            >
              {k === "runs" ? "Runs" : "Scheduled"}
            </button>
          ))}
        </div>

        <main className="st-body">
          {list.length === 0 ? (
            <div className="st-empty st-rise">
              <Search className="st-empty-icon" strokeWidth={1.4} />
              <p className="st-empty-text">{tab === "runs" ? "No runs yet" : "No schedules yet"}</p>
              <button type="button" className="st-empty-cta" onClick={() => setOpen(true)}>
                <Plus className="w-4 h-4" /> New schedule
              </button>
            </div>
          ) : (
            <div className="st-card st-rise">
              {list.map((t) => (
                <div key={t.id} className="st-item">
                  <span className="st-item-text">
                    <span className="st-item-title">{t.title}</span>
                    <span className="st-item-sub">
                      {t.repeat} · {t.time}
                    </span>
                  </span>
                  <button type="button" className="st-del" aria-label="Delete" onClick={() => remove(t.id)}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {open && (
        <div className="st-overlay" role="dialog" aria-modal="true" aria-label="New scheduled task">
          <div className="st-sheet">
            <header className="st-sheet-top">
              <button type="button" className="st-iconbtn" aria-label="Close" onClick={() => setOpen(false)}>
                <X className="w-5 h-5" />
              </button>
              <h2 className="st-sheet-title">New scheduled task</h2>
              <span className="st-iconbtn st-ghost" />
            </header>

            <div className="st-sheet-body">
              <p className="st-label">Title</p>
              <input
                className="st-input"
                placeholder="AI news digest"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <p className="st-label">Schedule</p>
              <div className="st-card">
                <label className="st-row">
                  <span className="st-row-label">Repeat</span>
                  <span className="st-row-value">
                    <select className="st-select" value={repeat} onChange={(e) => setRepeat(e.target.value as Repeat)}>
                      {REPEATS.map((r) => (
                        <option key={r} value={r}>
                          {r[0].toUpperCase() + r.slice(1)}
                        </option>
                      ))}
                    </select>
                    <ChevronsUpDown className="st-row-chev" />
                  </span>
                </label>
                <label className="st-row">
                  <span className="st-row-label">Time</span>
                  <span className="st-row-value">
                    <input type="time" className="st-time" value={time} onChange={(e) => setTime(e.target.value)} />
                  </span>
                </label>
                <label className="st-row">
                  <span className="st-row-label">Never ends</span>
                  <input
                    type="checkbox"
                    className="st-switch"
                    checked={neverEnds}
                    onChange={(e) => setNeverEnds(e.target.checked)}
                  />
                </label>
              </div>

              <p className="st-label">Prompt</p>
              <textarea
                className="st-textarea"
                rows={4}
                placeholder="Summarize the latest AI industry news"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />

              <p className="st-label">Approval requests</p>
              <div className="st-card">
                <label className="st-row">
                  <span className="st-row-label">Skip confirmations</span>
                  <input
                    type="checkbox"
                    className="st-switch"
                    checked={skipConfirmations}
                    onChange={(e) => setSkipConfirmations(e.target.checked)}
                  />
                </label>
              </div>
              <p className="st-hint">Approval is required before sending and publishing.</p>

              <p className="st-label">Advanced settings</p>
              <div className="st-card">
                <label className="st-row">
                  <span className="st-row-label">Run options</span>
                  <span className="st-row-value">
                    <select className="st-select" value={runOption} onChange={(e) => setRunOption(e.target.value)}>
                      {RUN_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <ChevronsUpDown className="st-row-chev" />
                  </span>
                </label>
                <button type="button" className="st-row" onClick={() => navigate("/settings/connectors")}>
                  <span className="st-row-label">Connectors</span>
                  <span className="st-row-value">
                    <Zap className="w-4 h-4 st-accent" />
                    <ChevronRight className="st-row-chev" />
                  </span>
                </button>
                <label className="st-row">
                  <span className="st-row-label">Agent</span>
                  <span className="st-row-value">
                    <select className="st-select" value={agent} onChange={(e) => setAgent(e.target.value)}>
                      {AGENTS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                    <ChevronsUpDown className="st-row-chev" />
                  </span>
                </label>
                <div className="st-row">
                  <span className="st-row-label">Project</span>
                  <span className="st-row-value st-muted">
                    None <ChevronRight className="st-row-chev" />
                  </span>
                </div>
                <div className="st-row">
                  <span className="st-row-label">Cloud computer</span>
                  <span className="st-row-value st-muted">
                    None <ChevronRight className="st-row-chev" />
                  </span>
                </div>
              </div>
            </div>

            <footer className="st-sheet-foot">
              <button type="button" className="st-save" onClick={saveTask}>
                Save
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

const stCss = `
.st-root {
  min-height: 100dvh; background: #1a1a1a; color: #e8e8e8;
  display: flex; justify-content: center;
  font-family: -apple-system, "SF Pro Display", Inter, "Segoe UI", Roboto, sans-serif;
}
.st-screen { width: 100%; max-width: 480px; }
.st-top {
  position: sticky; top: 0; z-index: 5; background: #1a1a1a;
  display: flex; align-items: center; justify-content: space-between;
  padding: calc(env(safe-area-inset-top, 0px) + 10px) 10px 10px;
}
.st-iconbtn {
  width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center;
  background: transparent; border: 0; color: #e8e8e8; cursor: pointer; -webkit-tap-highlight-color: transparent;
}
.st-ghost { pointer-events: none; }
.st-title, .st-sheet-title { font-size: 17px; font-weight: 600; margin: 0; }
.st-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin: 4px 12px 12px; background: #121212; border-radius: 12px; padding: 4px; }
.st-tab { border: 0; background: transparent; color: #9a9a9a; font-size: 14px; font-weight: 500; padding: 9px 0; border-radius: 9px; cursor: pointer; }
.st-tab.is-active { background: #3a3a3a; color: #fff; }
.st-body { padding: 8px 12px 40px; }
.st-empty { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 26vh 0 0; }
.st-empty-icon { width: 44px; height: 44px; color: #7c7c7c; }
.st-empty-text { margin: 0; color: #9a9a9a; font-size: 14px; }
.st-empty-cta {
  display: inline-flex; align-items: center; gap: 8px; background: #333; color: #f2f2f2;
  border: 0; border-radius: 12px; padding: 11px 18px; font-size: 14px; font-weight: 500; cursor: pointer;
}
.st-card { background: #262626; border-radius: 16px; padding: 0 14px; }
.st-item { display: flex; align-items: center; gap: 10px; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,.06); }
.st-item:last-child { border-bottom: 0; }
.st-item-text { flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.st-item-title { font-size: 14.5px; }
.st-item-sub { font-size: 12px; color: #8b8b8b; text-transform: capitalize; }
.st-del { background: transparent; border: 0; color: #9a9a9a; cursor: pointer; padding: 6px; }

.st-overlay { position: fixed; inset: 0; z-index: 60; background: rgba(0,0,0,.55); display: flex; align-items: flex-end; justify-content: center; }
.st-sheet {
  width: 100%; max-width: 480px; height: 94dvh; background: #1a1a1a;
  border-radius: 20px 20px 0 0; display: flex; flex-direction: column; overflow: hidden;
  animation: st-up .28s cubic-bezier(.22,.61,.36,1) both;
}
.st-sheet-top { display: flex; align-items: center; justify-content: space-between; padding: 10px; border-bottom: 1px solid rgba(255,255,255,.06); }
.st-sheet-body { flex: 1; overflow-y: auto; padding: 8px 14px 20px; }
.st-label { margin: 18px 4px 8px; font-size: 12.5px; color: #8b8b8b; }
.st-input, .st-textarea {
  width: 100%; background: #262626; border: 0; border-radius: 14px; color: #e8e8e8;
  font-size: 14.5px; padding: 14px; outline: none; font-family: inherit; resize: none;
}
.st-input::placeholder, .st-textarea::placeholder { color: #6f6f6f; }
.st-row {
  width: 100%; display: flex; align-items: center; gap: 12px; padding: 14px 0;
  border-bottom: 1px solid rgba(255,255,255,.06); background: transparent; border-left: 0; border-right: 0; border-top: 0;
  color: inherit; font-size: 14.5px; text-align: left; cursor: pointer;
}
.st-card > .st-row:last-child { border-bottom: 0; }
.st-row-label { flex: 1; }
.st-row-value { display: inline-flex; align-items: center; gap: 6px; color: #cfcfcf; font-size: 14px; }
.st-muted { color: #8b8b8b; }
.st-accent { color: #34d399; }
.st-row-chev { width: 16px; height: 16px; color: #7d7d7d; }
.st-select {
  appearance: none; background: transparent; border: 0; color: #cfcfcf; font-size: 14px;
  font-family: inherit; outline: none; text-align: right; cursor: pointer;
}
.st-select option { background: #262626; color: #e8e8e8; }
.st-time { background: #3a3a3a; border: 0; border-radius: 8px; color: #e8e8e8; font-size: 14px; padding: 6px 10px; font-family: inherit; }
.st-switch {
  appearance: none; width: 46px; height: 27px; border-radius: 999px; background: #4a4a4a;
  position: relative; cursor: pointer; transition: background .18s ease; flex: none;
}
.st-switch::after {
  content: ""; position: absolute; top: 3px; left: 3px; width: 21px; height: 21px;
  border-radius: 999px; background: #fff; transition: transform .18s ease;
}
.st-switch:checked { background: #2f6fed; }
.st-switch:checked::after { transform: translateX(19px); }
.st-hint { margin: 8px 4px 0; font-size: 12px; color: #7d7d7d; }
.st-sheet-foot { padding: 12px 14px calc(env(safe-area-inset-bottom, 0px) + 14px); border-top: 1px solid rgba(255,255,255,.06); }
.st-save {
  width: 100%; height: 50px; border: 0; border-radius: 14px; background: #a8a8a8; color: #141414;
  font-size: 15.5px; font-weight: 600; cursor: pointer;
}
.st-rise { animation: st-rise .32s cubic-bezier(.22,.61,.36,1) both; }
@keyframes st-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes st-up { from { transform: translateY(20px); opacity: 0; } to { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .st-rise, .st-sheet { animation: none; } }
`;
