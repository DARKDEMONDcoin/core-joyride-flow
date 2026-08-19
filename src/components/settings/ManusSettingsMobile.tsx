/** @doc Mobile settings — manus-style dark grouped list (matches reference design). */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lightbulb,
  Mail,
  Database,
  PanelBottom,
  Puzzle,
  Cable,
  Plug,
  UserRound,
  Globe,
  Moon,
  Eraser,
  Heart,
  HelpCircle,
  Asterisk,
  LogOut,
  ChevronsUpDown,
  Sparkles,
  ShieldCheck,
  Store,
  KeyRound,
  Gift,
  Lock,
  Activity,

} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useActiveAccount } from "@/hooks/useActiveAccount";
import { useCredits } from "@/hooks/useCredits";
import { t as authT, useUserLang, AVAILABLE_LANGS } from "@/lib/authI18n";
import { goBackOr } from "@/lib/navigation";
import { getThemeMode } from "@/lib/appTheme";

type Row = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  trailing?: string;
  path?: string;
  onClick?: () => void;
  external?: boolean;
  chevron?: "arrow" | "stepper" | "none";
  danger?: boolean;
};

const APP_VERSION = "v1.0.0";

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "U";

const ManusSettingsMobile = () => {
  const navigate = useNavigate();
  const account = useActiveAccount();
  const lang = useUserLang();
  const isAr = lang === "ar" || lang === "ar-eg" || lang === "he" || lang === "fa";
  const { plan, credits } = useCredits();
  const [userEmail, setUserEmail] = useState("");
  const [cacheSize, setCacheSize] = useState("0 KB");
  const themeMode = getThemeMode();

  const userName = account.name || userEmail.split("@")[0] || "User";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      setUserEmail(user.email || "");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      let bytes = 0;
      for (let i = 0; i < localStorage.length; i += 1) {
        const k = localStorage.key(i) ?? "";
        bytes += (k.length + (localStorage.getItem(k)?.length ?? 0)) * 2;
      }
      setCacheSize(bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(0)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);
    } catch {
      /* ignore */
    }
  }, []);

  const langLabel = useMemo(
    () => AVAILABLE_LANGS.find((l) => l.code === lang)?.native ?? "English",
    [lang],
  );

  const planLabel = (plan || "free").toLowerCase() === "free" ? "Free" : (plan || "").toUpperCase();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const clearCache = () => {
    try {
      const keep = Object.keys(localStorage).filter((k) => k.startsWith("sb-"));
      const saved = keep.map((k) => [k, localStorage.getItem(k)] as const);
      localStorage.clear();
      saved.forEach(([k, v]) => v != null && localStorage.setItem(k, v));
      setCacheSize("0 KB");
    } catch {
      /* ignore */
    }
  };

  const mainRows: Row[] = [
    { icon: Clock, label: isAr ? "المهام المجدولة" : "Scheduled tasks", path: "/settings/tasks" },
    { icon: Lightbulb, label: isAr ? "معرفة" : "Knowledge", path: "/settings/memory" },
    { icon: Mail, label: isAr ? "الإشعارات" : "Notifications", path: "/settings/notifications" },
    { icon: Database, label: isAr ? "ضوابط البيانات" : "Data controls", path: "/settings/privacy" },
    { icon: PanelBottom, label: isAr ? "متصفح السحابة" : "Cloud browser", path: "/settings/capabilities" },
    { icon: Puzzle, label: isAr ? "المهارات" : "Skills", path: "/settings/skills" },
    { icon: Cable, label: isAr ? "الموصلات" : "Connectors", path: "/settings/mcp" },
    { icon: Plug, label: isAr ? "التكاملات" : "Integrations", path: "/chat?integrations=1" },
  ];

  const advancedRows: Row[] = [
    { icon: Sparkles, label: isAr ? "لوحة التكاليف" : "Cost dashboard", path: "/settings/costs" },
    { icon: ShieldCheck, label: isAr ? "الموافقات" : "Approvals", path: "/settings/approvals" },
    { icon: Store, label: isAr ? "المتجر" : "Marketplace", path: "/settings/marketplace" },
    { icon: KeyRound, label: isAr ? "مفاتيح API" : "API keys", path: "/settings/api-keys" },
    { icon: Gift, label: isAr ? "الإحالات" : "Referrals", path: "/settings/referrals" },
  ];

  const accountRows: Row[] = [
    { icon: UserRound, label: isAr ? "الحساب" : "Account", path: "/settings/profile/edit" },
    { icon: Lock, label: isAr ? "الأمان" : "Security", path: "/settings/security" },
    { icon: Globe, label: isAr ? "اللغة" : "Language", trailing: langLabel, path: "/settings/language" },
    {
      icon: Moon,
      label: isAr ? "المظهر" : "Appearance",
      trailing: themeMode === "dark" ? (isAr ? "داكن" : "Dark") : isAr ? "فاتح" : "Light",
      path: "/settings/customization",
      chevron: "stepper",
    },
    { icon: Eraser, label: isAr ? "مسح ذاكرة التخزين المؤقت" : "Clear cache", trailing: cacheSize, onClick: clearCache },
  ];

  const linkRows: Row[] = [
    { icon: Heart, label: isAr ? "قيّم هذا التطبيق" : "Rate this app", external: true, onClick: () => window.open("https://megsyai.com", "_blank", "noopener") },
    { icon: HelpCircle, label: isAr ? "الحصول على مساعدة" : "Get help", path: "/settings/support" },
    { icon: Activity, label: isAr ? "حالة النظام" : "System status", path: "/settings/system-status" },
    { icon: Asterisk, label: isAr ? "الإصدار" : "Version", trailing: APP_VERSION, chevron: "none" },
  ];


  const renderRow = (row: Row, idx: number) => {
    const Icon = row.icon;
    const Chevron = isAr ? ChevronLeft : ChevronRight;
    return (
      <button
        key={row.label}
        type="button"
        onClick={() => (row.onClick ? row.onClick() : row.path && navigate(row.path))}
        disabled={!row.onClick && !row.path}
        className={`ms-row${idx > 0 ? " ms-row-div" : ""}${row.danger ? " ms-row-danger" : ""}`}
      >
        <Icon className="ms-row-icon" />
        <span className="ms-row-label">{row.label}</span>
        {row.trailing && <span className="ms-row-trailing">{row.trailing}</span>}
        {row.chevron === "stepper" ? (
          <ChevronsUpDown className="ms-row-chev" />
        ) : row.chevron === "none" ? null : row.external ? (
          <span className="ms-row-chev ms-row-ext">↗</span>
        ) : (
          <Chevron className="ms-row-chev" />
        )}
      </button>
    );
  };

  return (
    <div className="ms-root" dir={isAr ? "rtl" : "ltr"}>
      <style>{manusCss}</style>
      <div className="ms-screen">
        <header className="ms-header">
          <button type="button" className="ms-hbtn" aria-label={isAr ? "الإشعارات" : "Notifications"} onClick={() => navigate("/notifications")}>
            <Bell className="ms-hicon" />
            <span className="ms-dot" />
          </button>
          <h1 className="ms-brand">megsy</h1>
          <button type="button" className="ms-hbtn" aria-label={authT("back")} onClick={() => goBackOr(navigate, "/chat")}>
            {isAr ? <ChevronLeft className="ms-hicon" /> : <ChevronRight className="ms-hicon" />}
          </button>
        </header>

        <div className="ms-body">
          {/* Profile */}
          <button type="button" className="ms-card ms-profile" onClick={() => navigate("/settings/profile/edit")}>
            {account.avatarUrl ? (
              <img src={account.avatarUrl} alt="" className="ms-avatar" loading="lazy" decoding="async" />
            ) : (
              <span className="ms-avatar ms-avatar-fallback">{initialsOf(userName)}</span>
            )}
            <span className="ms-profile-text">
              <span className="ms-profile-name">{userName}</span>
              <span className="ms-profile-sub">{isAr ? "شخصي" : "Personal"}</span>
            </span>
          </button>

          {/* Plan */}
          <section className="ms-card">
            <div className="ms-plan-row">
              <span className="ms-plan-name">{planLabel}</span>
              <button type="button" className="ms-plan-cta" onClick={() => navigate("/pricing")}>
                {isAr ? "ترقية" : "Upgrade"}
              </button>
            </div>
            <button type="button" className="ms-row ms-row-div" onClick={() => navigate("/usage")}>
              <Sparkles className="ms-row-icon" />
              <span className="ms-row-label">{isAr ? "رصيد" : "Credits"}</span>
              <span className="ms-row-trailing">{credits ?? 0}</span>
              {isAr ? <ChevronLeft className="ms-row-chev" /> : <ChevronRight className="ms-row-chev" />}
            </button>
          </section>

          <section className="ms-card">{mainRows.map(renderRow)}</section>
          <section className="ms-card">{accountRows.map(renderRow)}</section>
          <section className="ms-card">{linkRows.map(renderRow)}</section>

          <section className="ms-card">
            <button type="button" className="ms-row" onClick={handleLogout}>
              <LogOut className="ms-row-icon" />
              <span className="ms-row-label">{isAr ? "تسجيل الخروج" : "Log out"}</span>
            </button>
          </section>

          <div className="ms-spacer" />
        </div>
      </div>
    </div>
  );
};

const manusCss = `
.ms-root {
  min-height: 100dvh;
  background: var(--mn-bg);
  color: var(--mn-fg);
  display: flex;
  justify-content: center;
  font-family: -apple-system, "SF Pro Display", Inter, "Segoe UI", Roboto, sans-serif;
}
.ms-screen { width: 100%; max-width: 480px; }
.ms-header {
  position: sticky; top: 0; z-index: 5;
  display: flex; align-items: center; justify-content: space-between;
  padding: calc(env(safe-area-inset-top, 0px) + 10px) 12px 10px;
  background: var(--mn-bg);
}
.ms-hbtn {
  position: relative; width: 40px; height: 40px;
  display: inline-flex; align-items: center; justify-content: center;
  background: transparent; border: 0; color: var(--mn-fg); cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.ms-hicon { width: 24px; height: 24px; }
.ms-dot {
  position: absolute; top: 7px; inset-inline-start: 7px;
  width: 8px; height: 8px; border-radius: 999px; background: var(--mn-danger);
}
.ms-brand {
  margin: 0; font-size: 26px; font-weight: 600; letter-spacing: -0.01em;
  font-family: "Times New Roman", Georgia, serif;
}
.ms-body { padding: 6px 14px 0; display: flex; flex-direction: column; gap: 22px; }
.ms-card {
  width: 100%;
  background: var(--mn-card);
  border-radius: 18px;
  overflow: hidden;
  border: 0;
}
button.ms-card { cursor: pointer; }
.ms-profile {
  display: flex; align-items: center; gap: 14px;
  padding: 18px 16px; text-align: start; color: inherit;
}
.ms-avatar {
  width: 52px; height: 52px; border-radius: 999px; object-fit: cover; flex-shrink: 0;
}
.ms-avatar-fallback {
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--mn-avatar); color: #fff; font-size: 20px; font-weight: 600;
}
.ms-profile-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.ms-profile-name { font-size: 19px; font-weight: 600; }
.ms-profile-sub { font-size: 13px; color: var(--mn-muted); }
.ms-plan-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 16px;
}
.ms-plan-name { font-size: 22px; font-weight: 700; font-family: "Times New Roman", Georgia, serif; }
.ms-plan-cta {
  background: var(--mn-cta-bg); color: var(--mn-cta-fg); border: 0; cursor: pointer;
  border-radius: 10px; padding: 8px 16px; font-size: 14px; font-weight: 600;
}
.ms-row {
  width: 100%;
  display: flex; align-items: center; gap: 14px;
  padding: 15px 16px;
  background: transparent; border: 0; color: var(--mn-fg);
  text-align: start; font: inherit; cursor: pointer;
  transition: background-color 160ms ease;
}
.ms-row:disabled { cursor: default; }
.ms-row:active:not(:disabled) { background: var(--mn-sep); }
.ms-row-div { box-shadow: inset 0 1px 0 var(--mn-sep); }
.ms-row-icon { width: 22px; height: 22px; flex-shrink: 0; color: var(--mn-fg); opacity: 0.95; }
.ms-row-label { flex: 1; font-size: 16px; font-weight: 500; }
.ms-row-trailing { font-size: 15px; color: var(--mn-muted); flex-shrink: 0; }
.ms-row-chev { width: 18px; height: 18px; flex-shrink: 0; color: rgba(232,232,232,0.4); }
.ms-row-ext { font-size: 15px; line-height: 1; }
.ms-spacer { height: calc(env(safe-area-inset-bottom, 0px) + 32px); }

`;

export default ManusSettingsMobile;
