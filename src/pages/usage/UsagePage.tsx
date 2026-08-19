/** @doc Usage — plan card, credit balance and dated credit-usage history. */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, Sparkles, CalendarClock, HelpCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCredits } from "@/hooks/useCredits";
import { goBackOr } from "@/lib/navigation";

type Tx = {
  id: string;
  amount: number;
  description: string | null;
  action_type: string | null;
  created_at: string;
};

const DAILY_REFRESH = 300;

const dayLabel = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

const UsagePage = () => {
  const navigate = useNavigate();
  const { credits, plan } = useCredits();
  const [rows, setRows] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  const planLabel = (plan || "free").toLowerCase() === "free" ? "Free" : (plan || "").toUpperCase();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("credit_transactions")
        .select("id, amount, description, action_type, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(80);
      if (cancelled) return;
      setRows((data as Tx[]) ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, Tx[]>();
    rows.forEach((r) => {
      const key = dayLabel(r.created_at);
      map.set(key, [...(map.get(key) ?? []), r]);
    });
    return Array.from(map.entries());
  }, [rows]);

  return (
    <div className="usg-root" dir="ltr">
      <style>{usageCss}</style>
      <div className="usg-screen">
        <header className="usg-top">
          <button type="button" className="usg-iconbtn" aria-label="Back" onClick={() => goBackOr(navigate, "/settings")}>
            <ChevronLeft className="w-5 h-5" strokeWidth={2} />
          </button>
          <h1 className="usg-title">Usage</h1>
          <span className="usg-iconbtn usg-ghost" />
        </header>

        <main className="usg-body">
          <section className="usg-card usg-rise">
            <div className="usg-plan">
              <span className="usg-plan-name">{planLabel}</span>
              <button type="button" className="usg-cta" onClick={() => navigate("/pricing")}>
                Upgrade
              </button>
            </div>

            <button type="button" className="usg-banner" onClick={() => navigate("/pricing")}>
              <span>Megsy 1.6 free for a limited time</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="usg-line">
              <Sparkles className="usg-licon" />
              <span className="usg-llabel">Credits</span>
              <HelpCircle className="usg-lhelp" />
              <span className="usg-lvalue">{credits ?? 0}</span>
            </div>
            <div className="usg-line usg-line-sub">
              <span className="usg-llabel usg-muted">Free credits</span>
              <span className="usg-lvalue usg-muted">{credits ?? 0}</span>
            </div>
            <div className="usg-line">
              <CalendarClock className="usg-licon" />
              <span className="usg-llabel">
                Daily credit refresh
                <small>Refreshes daily at 00:00 to {DAILY_REFRESH}</small>
              </span>
              <span className="usg-lvalue">{DAILY_REFRESH}</span>
            </div>
          </section>

          {loading ? (
            <div className="usg-state"><Loader2 className="w-5 h-5 animate-spin" /></div>
          ) : groups.length === 0 ? (
            <div className="usg-state">No usage yet</div>
          ) : (
            groups.map(([day, items], gi) => (
              <section key={day} className="usg-group usg-rise" style={{ animationDelay: `${60 + gi * 40}ms` }}>
                <h2 className="usg-day">{day}</h2>
                <div className="usg-card usg-list">
                  {items.map((it) => (
                    <div key={it.id} className="usg-item">
                      <span className="usg-item-title">{it.description || it.action_type || "Task"}</span>
                      <span className="usg-item-cost">{Math.abs(Number(it.amount) || 0)}</span>
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}
          <div className="usg-spacer" />
        </main>
      </div>
    </div>
  );
};

const usageCss = `
.usg-root {
  min-height: 100dvh; background: var(--mn-bg); color: var(--mn-fg);
  display: flex; justify-content: center;
  font-family: -apple-system, "SF Pro Display", Inter, "Segoe UI", Roboto, sans-serif;
}
.usg-screen { width: 100%; max-width: 480px; }
.usg-top {
  position: sticky; top: 0; z-index: 5; background: var(--mn-bg);
  display: flex; align-items: center; justify-content: space-between;
  padding: calc(env(safe-area-inset-top, 0px) + 10px) 10px 10px;
}
.usg-iconbtn {
  width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center;
  background: transparent; border: 0; color: var(--mn-fg); cursor: pointer; -webkit-tap-highlight-color: transparent;
}
.usg-ghost { pointer-events: none; }
.usg-title { font-size: 17px; font-weight: 600; margin: 0; }
.usg-body { padding: 4px 12px 32px; display: flex; flex-direction: column; gap: 18px; }
.usg-card { background: var(--mn-card); border-radius: 16px; padding: 14px 14px 6px; }
.usg-plan { display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px dashed var(--mn-sep); }
.usg-plan-name { font-size: 22px; font-weight: 700; letter-spacing: -.01em; }
.usg-cta {
  background: #fff; color: #111; border: 0; border-radius: 10px;
  font-size: 14px; font-weight: 600; padding: 8px 16px; cursor: pointer;
}
.usg-banner {
  width: 100%; margin: 12px 0 6px; display: flex; align-items: center; justify-content: space-between;
  gap: 10px; background: rgba(59,130,246,.14); color: #7fb0ff; border: 0; border-radius: 12px;
  padding: 12px 14px; font-size: 13.5px; font-weight: 500; cursor: pointer; text-align: left;
}
.usg-line { display: flex; align-items: center; gap: 10px; padding: 12px 2px; }
.usg-line-sub { padding-top: 0; }
.usg-licon { width: 18px; height: 18px; color: var(--mn-fg); flex: none; }
.usg-llabel { flex: 1; font-size: 14.5px; display: flex; flex-direction: column; gap: 2px; }
.usg-llabel small { font-size: 11.5px; color: var(--mn-muted); }
.usg-lhelp { width: 14px; height: 14px; color: var(--mn-faint); }
.usg-lvalue { font-size: 14.5px; font-weight: 600; }
.usg-muted { color: var(--mn-muted); font-weight: 400; padding-inline-start: 28px; }
.usg-group { display: flex; flex-direction: column; gap: 8px; }
.usg-day { font-size: 12.5px; color: var(--mn-muted); margin: 0 4px; font-weight: 500; }
.usg-list { padding: 2px 14px; }
.usg-item { display: flex; align-items: center; gap: 12px; padding: 15px 0; border-bottom: 1px solid var(--mn-sep); }
.usg-item:last-child { border-bottom: 0; }
.usg-item-title { flex: 1; font-size: 14.5px; line-height: 1.35; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; }
.usg-item-cost { font-size: 14px; color: var(--mn-muted); }
.usg-state { display: flex; align-items: center; justify-content: center; padding: 40px 0; color: var(--mn-muted); font-size: 14px; }
.usg-spacer { height: env(safe-area-inset-bottom, 0px); }
.usg-rise { animation: usg-rise .32s cubic-bezier(.22,.61,.36,1) both; }
@keyframes usg-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .usg-rise { animation: none; } }
`;

export default UsagePage;
