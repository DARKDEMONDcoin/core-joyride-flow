/** @doc Notifications inbox — grouped feed with All / Updates / Messages tabs. */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { goBackOr } from "@/lib/navigation";

type Row = {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  metadata: Record<string, unknown> | null;
};

type TabKey = "all" | "updates" | "messages";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "updates", label: "Updates" },
  { key: "messages", label: "Messages" },
];

const MESSAGE_TYPES = new Set(["message", "chat", "reply", "mention", "support"]);

function dayLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

const NotificationsInboxPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("all");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const uid = auth.user?.id;
        if (!uid) {
          if (!cancelled) setLoading(false);
          return;
        }
        const { data } = await supabase
          .from("notifications")
          .select("id,title,message,type,read,created_at,metadata")
          .eq("user_id", uid)
          .order("created_at", { ascending: false })
          .limit(100);
        if (cancelled) return;
        setRows((data as unknown as Row[]) ?? []);
        setLoading(false);
        const unread = (data ?? []).filter((r) => !r.read).map((r) => r.id);
        if (unread.length) {
          void supabase.from("notifications").update({ read: true }).in("id", unread);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (tab === "all") return rows;
    if (tab === "messages") return rows.filter((r) => MESSAGE_TYPES.has(r.type));
    return rows.filter((r) => !MESSAGE_TYPES.has(r.type));
  }, [rows, tab]);

  const groups = useMemo(() => {
    const map = new Map<string, Row[]>();
    for (const r of filtered) {
      const k = dayLabel(r.created_at);
      const arr = map.get(k);
      if (arr) arr.push(r);
      else map.set(k, [r]);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="nti-root" dir="ltr">
      <style>{ntiCss}</style>

      <header className="nti-topbar">
        <button
          className="nti-icon-btn"
          aria-label="Back"
          onClick={() => goBackOr(navigate, "/settings")}
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2} />
        </button>
        <h1 className="nti-title">Notifications</h1>
        <div className="nti-icon-btn nti-icon-btn-ghost" />
      </header>

      <div className="nti-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            className={`nti-tab ${tab === t.key ? "is-active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main className="nti-main">
        {loading ? (
          <div className="nti-state">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : groups.length === 0 ? (
          <div className="nti-state nti-empty">
            <p className="nti-empty-title">You're all caught up</p>
            <p className="nti-empty-sub">New updates and messages will appear here.</p>
          </div>
        ) : (
          groups.map(([day, items], gi) => (
            <section key={day} className="nti-group" style={{ animationDelay: `${gi * 40}ms` }}>
              <h2 className="nti-day">{day}</h2>
              {items.map((n) => {
                const image =
                  (n.metadata && typeof n.metadata["image_url"] === "string"
                    ? (n.metadata["image_url"] as string)
                    : null) ?? null;
                return (
                  <article key={n.id} className="nti-card">
                    {image && (
                      <div className="nti-media">
                        <img src={image} alt="" loading="lazy" />
                      </div>
                    )}
                    <h3 className="nti-card-title">{n.title}</h3>
                    {n.message && <p className="nti-card-body">{n.message}</p>}
                  </article>
                );
              })}
            </section>
          ))
        )}
        <div className="nti-spacer" />
      </main>
    </div>
  );
};

const ntiCss = `
.nti-root {
  min-height: 100dvh;
  background: #1a1a1a;
  color: #e8e8e8;
  font-family: "Neue Haas Unica", "Helvetica Now Display", -apple-system, "SF Pro Display", Inter, "Segoe UI", Roboto, sans-serif;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
.nti-topbar {
  position: sticky; top: 0; z-index: 5;
  display: grid; grid-template-columns: 40px 1fr 40px;
  align-items: center;
  padding: calc(env(safe-area-inset-top, 0px) + 10px) 14px 10px;
  background: #1a1a1a;
}
.nti-title {
  margin: 0; text-align: center;
  font-size: 17px; font-weight: 600;
  letter-spacing: -0.01em; color: #e8e8e8;
}
.nti-icon-btn {
  width: 40px; height: 40px;
  display: inline-grid; place-items: center;
  border-radius: 999px;
  background: transparent; border: 0;
  color: #e8e8e8; cursor: pointer;
  transition: transform 160ms ease;
}
.nti-icon-btn:active { transform: scale(0.94); }
.nti-icon-btn-ghost { pointer-events: none; }

.nti-tabs {
  display: grid; grid-auto-flow: column; grid-auto-columns: 1fr;
  gap: 4px;
  margin: 4px 16px 8px;
  padding: 4px;
  background: #131313;
  border-radius: 14px;
}
.nti-tab {
  padding: 9px 10px;
  border: 0; border-radius: 11px;
  background: transparent;
  color: rgba(232,232,232,0.55);
  font: inherit; font-size: 14px; font-weight: 500;
  cursor: pointer;
  transition: background 180ms ease, color 180ms ease;
}
.nti-tab.is-active { background: #2e2e2e; color: #e8e8e8; }

.nti-main { padding: 4px 16px 24px; }
.nti-group { animation: nti-rise 320ms cubic-bezier(0.16,1,0.3,1) both; }
.nti-day {
  margin: 18px 4px 10px;
  font-size: 13px; font-weight: 500;
  color: rgba(232,232,232,0.45);
}
.nti-card {
  background: #262626;
  border-radius: 18px;
  padding: 12px 14px 16px;
  margin-bottom: 12px;
}
.nti-media {
  border-radius: 12px; overflow: hidden;
  margin-bottom: 12px; background: #1a1a1a;
  aspect-ratio: 16 / 10;
}
.nti-media img { width: 100%; height: 100%; object-fit: cover; display: block; }
.nti-card-title {
  margin: 0 0 6px;
  font-size: 15.5px; font-weight: 600;
  color: #e8e8e8; letter-spacing: -0.01em;
}
.nti-card-body {
  margin: 0;
  font-size: 14px; line-height: 1.5;
  color: rgba(232,232,232,0.55);
}

.nti-state {
  display: grid; place-items: center;
  padding: 72px 16px;
  color: rgba(232,232,232,0.5);
}
.nti-empty { gap: 6px; text-align: center; }
.nti-empty-title { margin: 0; font-size: 15.5px; font-weight: 600; color: #e8e8e8; }
.nti-empty-sub { margin: 0; font-size: 14px; color: rgba(232,232,232,0.5); }

.nti-spacer { height: 32px; }

@keyframes nti-rise {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: none; }
}
`;

export default NotificationsInboxPage;
