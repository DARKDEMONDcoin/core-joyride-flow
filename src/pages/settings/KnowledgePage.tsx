/** @doc Knowledge — user knowledge entries list + add sheet (mobile-first, flat dark design). */
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Lightbulb, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { goBackOr } from "@/lib/navigation";

type KnowledgeRow = {
  id: string;
  name: string;
  use_when: string;
  content: string;
  enabled: boolean;
  created_at: string;
};

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

const KnowledgePage = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<KnowledgeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [useWhen, setUseWhen] = useState("");
  const [content, setContent] = useState("");

  const load = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("user_knowledge")
      .select("id,name,use_when,content,enabled,created_at")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    setRows((data as unknown as KnowledgeRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openSheet = () => {
    setName("");
    setUseWhen("");
    setContent("");
    setSheetOpen(true);
  };

  const save = async () => {
    if (!useWhen.trim() || !content.trim()) {
      toast.error("Please fill in the required fields");
      return;
    }
    setSaving(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error("no user");
      const { error } = await supabase.from("user_knowledge").insert({
        user_id: uid,
        name: name.trim().slice(0, 120),
        use_when: useWhen.trim().slice(0, 500),
        content: content.trim().slice(0, 5000),
      });
      if (error) throw error;
      setSheetOpen(false);
      await load();
    } catch {
      toast.error("Could not save knowledge");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (row: KnowledgeRow) => {
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, enabled: !r.enabled } : r)));
    const { error } = await supabase
      .from("user_knowledge")
      .update({ enabled: !row.enabled })
      .eq("id", row.id);
    if (error) {
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, enabled: row.enabled } : r)));
    }
  };

  return (
    <div className="kn-root" dir="ltr">
      <style>{knCss}</style>

      <header className="kn-topbar">
        <button className="kn-icon-btn" aria-label="Back" onClick={() => goBackOr(navigate, "/settings")}>
          <ChevronLeft className="w-5 h-5" strokeWidth={2} />
        </button>
        <h1 className="kn-title">Knowledge</h1>
        <button className="kn-icon-btn" aria-label="Add knowledge" onClick={openSheet}>
          <Plus className="w-5 h-5" strokeWidth={2} />
        </button>
      </header>

      <main className="kn-main">
        {loading ? (
          <div className="kn-state">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="kn-empty">
            <Lightbulb className="kn-empty-icon" strokeWidth={1.4} />
            <p className="kn-empty-text">No knowledge yet</p>
            <button className="kn-cta" onClick={openSheet}>
              <Plus className="w-4 h-4" strokeWidth={2.2} />
              Add now
            </button>
          </div>
        ) : (
          <ul className="kn-list">
            {rows.map((r, i) => (
              <li key={r.id} className="kn-card" style={{ animationDelay: `${i * 40}ms` }}>
                <p className="kn-card-name">{r.name || "Untitled"}</p>
                <p className="kn-card-when">{r.use_when}</p>
                <div className="kn-card-foot">
                  <button
                    className={`kn-status ${r.enabled ? "is-on" : ""}`}
                    onClick={() => toggle(r)}
                  >
                    <span className="kn-dot" />
                    {r.enabled ? "Enabled" : "Disabled"}
                  </button>
                  <span className="kn-time">{timeLabel(r.created_at)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      {sheetOpen && (
        <div className="kn-sheet-wrap" role="dialog" aria-modal="true" aria-label="Add knowledge">
          <div className="kn-scrim" onClick={() => setSheetOpen(false)} />
          <div className="kn-sheet">
            <header className="kn-sheet-top">
              <button className="kn-icon-btn" aria-label="Close" onClick={() => setSheetOpen(false)}>
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
              <h2 className="kn-sheet-title">Add knowledge</h2>
              <button className="kn-save" onClick={save} disabled={saving}>
                {saving ? "Saving" : "Save"}
              </button>
            </header>

            <div className="kn-fields">
              <label className="kn-label" htmlFor="kn-name">Name</label>
              <input
                id="kn-name"
                className="kn-input"
                placeholder="Knowledge name"
                maxLength={120}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <label className="kn-label" htmlFor="kn-when">
                Use when <span className="kn-req">*</span>
              </label>
              <textarea
                id="kn-when"
                className="kn-input kn-area"
                placeholder="When should this knowledge be used"
                maxLength={500}
                value={useWhen}
                onChange={(e) => setUseWhen(e.target.value)}
              />

              <label className="kn-label" htmlFor="kn-content">
                Content <span className="kn-req">*</span>
              </label>
              <textarea
                id="kn-content"
                className="kn-input kn-area kn-area-lg"
                placeholder="Knowledge content"
                maxLength={5000}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const knCss = `
.kn-root {
  min-height: 100dvh;
  background: var(--mn-bg);
  color: var(--mn-fg);
  font-family: "Neue Haas Unica", "Helvetica Now Display", -apple-system, "SF Pro Display", Inter, "Segoe UI", Roboto, sans-serif;
}
.kn-topbar {
  position: sticky; top: 0; z-index: 5;
  display: grid; grid-template-columns: 40px 1fr 40px; align-items: center;
  padding: calc(env(safe-area-inset-top, 0px) + 10px) 14px 10px;
  background: var(--mn-bg);
}
.kn-title { margin: 0; text-align: center; font-size: 17px; font-weight: 600; letter-spacing: -0.01em; }
.kn-icon-btn {
  width: 40px; height: 40px; display: inline-grid; place-items: center;
  border: 0; background: transparent; color: var(--mn-fg); border-radius: 999px;
  cursor: pointer; transition: transform 160ms ease;
}
.kn-icon-btn:active { transform: scale(0.94); }

.kn-main { padding: 8px 16px 32px; }
.kn-state { display: grid; place-items: center; padding: 80px 0; color: rgba(232,232,232,0.5); }

.kn-empty {
  display: grid; justify-items: center; gap: 14px;
  padding: 34dvh 16px 0;
  animation: kn-rise 320ms cubic-bezier(0.16,1,0.3,1) both;
}
.kn-empty-icon { width: 46px; height: 46px; color: var(--mn-muted); }
.kn-empty-text { margin: 0; font-size: 15px; color: rgba(232,232,232,0.5); }
.kn-cta {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 20px; border: 0; border-radius: 14px;
  background: var(--mn-cta-bg); color: var(--mn-cta-fg);
  font: inherit; font-size: 15px; font-weight: 600;
  cursor: pointer; transition: transform 160ms ease, opacity 160ms ease;
}
.kn-cta:active { transform: scale(0.97); opacity: 0.9; }

.kn-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
.kn-card {
  background: var(--mn-card); border-radius: 18px; padding: 14px 16px 8px;
  animation: kn-rise 320ms cubic-bezier(0.16,1,0.3,1) both;
}
.kn-card-name { margin: 0 0 6px; font-size: 15.5px; font-weight: 600; letter-spacing: -0.01em; }
.kn-card-when { margin: 0 0 12px; font-size: 14px; line-height: 1.5; color: rgba(232,232,232,0.5); }
.kn-card-foot {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 0 8px; border-top: 1px solid var(--mn-sep);
}
.kn-status {
  display: inline-flex; align-items: center; gap: 7px;
  border: 0; background: transparent; padding: 0;
  font: inherit; font-size: 14px; color: var(--mn-muted); cursor: pointer;
}
.kn-status.is-on { color: var(--mn-accent); }
.kn-dot { width: 7px; height: 7px; border-radius: 999px; background: currentColor; }
.kn-time { font-size: 14px; color: rgba(232,232,232,0.4); }

.kn-sheet-wrap { position: fixed; inset: 0; z-index: 60; }
.kn-scrim { position: absolute; inset: 0; background: rgba(0,0,0,0.55); animation: kn-fade 200ms ease both; }
.kn-sheet {
  position: absolute; inset: 6dvh 0 0; background: var(--mn-sheet);
  border-radius: 22px 22px 0 0; overflow-y: auto;
  animation: kn-up 300ms cubic-bezier(0.16,1,0.3,1) both;
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 24px);
}
.kn-sheet-top {
  position: sticky; top: 0; z-index: 2; background: var(--mn-sheet);
  display: grid; grid-template-columns: 40px 1fr auto; align-items: center;
  padding: 12px 14px;
}
.kn-sheet-title { margin: 0; text-align: center; font-size: 16.5px; font-weight: 600; }
.kn-save {
  border: 0; background: transparent; color: var(--mn-fg);
  font: inherit; font-size: 15px; font-weight: 600; padding: 8px 10px; cursor: pointer;
}
.kn-save:disabled { opacity: 0.5; }

.kn-fields { padding: 8px 16px 0; display: grid; gap: 8px; }
.kn-label { margin-top: 14px; font-size: 14px; color: rgba(232,232,232,0.7); }
.kn-req { color: var(--mn-danger); }
.kn-input {
  width: 100%; box-sizing: border-box;
  background: var(--mn-input); border: 1px solid transparent; border-radius: 14px;
  padding: 14px 16px; color: var(--mn-fg); font: inherit; font-size: 15px;
  outline: none; transition: border-color 160ms ease, background 160ms ease;
}
.kn-input::placeholder { color: var(--mn-muted); }
.kn-input:focus { border-color: rgba(255,255,255,0.18); background: var(--mn-card-2); }
.kn-area { min-height: 92px; resize: none; line-height: 1.5; }
.kn-area-lg { min-height: 140px; }

@keyframes kn-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes kn-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes kn-up { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
`;

export default KnowledgePage;
