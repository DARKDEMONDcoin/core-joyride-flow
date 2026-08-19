/** @doc Mobile /pricing — clean single-screen redesign.
 *  Menu button → hero with Megsy logo → colored model marquee →
 *  Max/Pro toggle → real Pro/Max vs Free comparison → Monthly/Yearly cards →
 *  Fixed subscribe button. No scroll: everything fits within 100dvh.
 */
import { useEffect, useMemo, useState } from "react";

function useIsLightTheme() {
  const [light, setLight] = useState(
    typeof document !== "undefined" &&
      document.documentElement.getAttribute("data-theme") === "light",
  );
  useEffect(() => {
    const el = document.documentElement;
    const update = () => setLight(el.getAttribute("data-theme") === "light");
    const obs = new MutationObserver(update);
    obs.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    update();
    return () => obs.disconnect();
  }, []);
  return light;
}
import {
  Sparkles,
  SearchCheck,
  Code2,
  LayoutPanelTop,
  GraduationCap,
  Image as ImageIcon,
  Clapperboard,
  ListChecks,
  type LucideIcon,
} from "lucide-react";
import { MobileSidebarButton } from "@/components/shared/MobileSidebarButton";
import { useUserLang } from "@/lib/authI18n";
import { type PlanTier } from "@/data/pricingData";

interface Props {
  isYearly: boolean;
  onToggleYearly: (yearly: boolean) => void;
  onSubscribe: (tier: PlanTier) => void;
  loadingTier?: PlanTier | null;
  onMenuClick?: () => void;
}

interface FeatureRow {
  title: string;
  icon: LucideIcon;
  value: "yes" | "limited" | "no";
  note?: string;
  freeValue: "yes" | "limited" | "no";
  freeNote?: string;
}

export default function MobilePricingScreen({
  isYearly,
  onToggleYearly,
  onSubscribe,
  loadingTier,
  onMenuClick,
}: Props) {
  const lang = useUserLang();
  const isAr = lang === "ar";
  const [plan, setPlan] = useState<"pro" | "max">("pro");

  // ---------- Feature matrix ----------
  // Everything is Unlimited on paid plans EXCEPT paid image/video generation:
  //  · Premium images (Flux Pro · GPT Image · Imagen) → Pro: credits, Max: UNLIMITED
  //  · Premium videos (Sora · Seedance · Kling)      → Pro: 240 MC, Max: 500 MC
  // Feature rows written like ChatGPT-Plus / Claude-Pro / Perplexity-Pro:
  // one concept per line, short label, quantitative value on the right.
  // Sourced from src/data/pricingData.ts + src/data/siteKnowledge.md.
  // Feature rows — single line, benefit-first, real quotas from siteKnowledge.
  // Style inspired by ChatGPT-Plus / Claude-Pro / Perplexity-Pro / Cursor:
  // short label on the left, quantitative value chip on the right.
  const proFeatures: FeatureRow[] = isAr
    ? [
        { title: "محادثة · النماذج الرائدة",     icon: Sparkles, value: "yes", note: "∞",  freeValue: "limited", freeNote: "محدود" },
        { title: "بحث معمّق",                     icon: SearchCheck, value: "yes", note: "∞",  freeValue: "limited", freeNote: "٣/يوم" },
        { title: "Megsy Coder",                    icon: Code2, value: "yes", note: "∞",  freeValue: "no" },
        { title: "مستندات وعروض",                 icon: LayoutPanelTop, value: "yes", note: "∞",  freeValue: "limited", freeNote: "٣/يوم" },
        { title: "تعليم · مهارات · MCP",          icon: GraduationCap, value: "yes", note: "∞",     freeValue: "yes" },
        { title: "صور احترافية",                  icon: ImageIcon, value: "yes", note: "٢٤٠/شهر",   freeValue: "no" },
        { title: "فيديو سينمائي",                 icon: Clapperboard, value: "yes", note: "٢٤٠/شهر",   freeValue: "no" },
        { title: "أولوية وتكاملات",               icon: ListChecks, value: "yes", note: "∞",     freeValue: "limited", freeNote: "قياسي" },
      ]
    : [
        { title: "Chat · flagship models",         icon: Sparkles, value: "yes", note: "∞", freeValue: "limited", freeNote: "Lite" },
        { title: "Deep Research",                  icon: SearchCheck, value: "yes", note: "∞", freeValue: "limited", freeNote: "3/day" },
        { title: "Megsy Coder",                    icon: Code2, value: "yes", note: "∞", freeValue: "no" },
        { title: "Docs & Slides",                  icon: LayoutPanelTop, value: "yes", note: "∞", freeValue: "limited", freeNote: "3/day" },
        { title: "Study · Skills · MCP",           icon: GraduationCap, value: "yes", note: "∞",  freeValue: "yes" },
        { title: "Pro images",                     icon: ImageIcon, value: "yes", note: "240 / mo",  freeValue: "no" },
        { title: "Cinematic video",                icon: Clapperboard, value: "yes", note: "240 / mo",  freeValue: "no" },
        { title: "Priority & integrations",        icon: ListChecks, value: "yes", note: "∞",  freeValue: "limited", freeNote: "Standard" },
      ];

  const maxFeatures: FeatureRow[] = isAr
    ? [
        { title: "محادثة · النماذج الرائدة",     icon: Sparkles, value: "yes", note: "∞",  freeValue: "limited", freeNote: "محدود" },
        { title: "بحث معمّق",                     icon: SearchCheck, value: "yes", note: "∞",  freeValue: "limited", freeNote: "٣/يوم" },
        { title: "Megsy Coder",                    icon: Code2, value: "yes", note: "∞",  freeValue: "no" },
        { title: "مستندات وعروض",                 icon: LayoutPanelTop, value: "yes", note: "∞",  freeValue: "limited", freeNote: "٣/يوم" },
        { title: "تعليم · مهارات · MCP",          icon: GraduationCap, value: "yes", note: "∞",     freeValue: "yes" },
        { title: "صور احترافية",                  icon: ImageIcon, value: "yes", note: "∞",  freeValue: "no" },
        { title: "فيديو سينمائي",                 icon: Clapperboard, value: "yes", note: "٥٠٠/شهر",   freeValue: "no" },
        { title: "أولوية ×٣ وتكاملات",            icon: ListChecks, value: "yes", note: "×٣ أسرع",   freeValue: "limited", freeNote: "قياسي" },
      ]
    : [
        { title: "Chat · flagship models",         icon: Sparkles, value: "yes", note: "∞", freeValue: "limited", freeNote: "Lite" },
        { title: "Deep Research",                  icon: SearchCheck, value: "yes", note: "∞", freeValue: "limited", freeNote: "3/day" },
        { title: "Megsy Coder",                    icon: Code2, value: "yes", note: "∞", freeValue: "no" },
        { title: "Docs & Slides",                  icon: LayoutPanelTop, value: "yes", note: "∞", freeValue: "limited", freeNote: "3/day" },
        { title: "Study · Skills · MCP",           icon: GraduationCap, value: "yes", note: "∞",  freeValue: "yes" },
        { title: "Pro images",                     icon: ImageIcon, value: "yes", note: "∞", freeValue: "no" },
        { title: "Cinematic video",                icon: Clapperboard, value: "yes", note: "500 / mo",  freeValue: "no" },
        { title: "3× priority & integrations",     icon: ListChecks, value: "yes", note: "3× faster", freeValue: "limited", freeNote: "Standard" },
      ];

  const features = plan === "pro" ? proFeatures : maxFeatures;

  const t = useMemo(
    () =>
      isAr
        ? {
            heroA: "منصة",
            heroB: "ذكاء واحدة.",
            heroC: "إمكانيات لا نهائية.",
            max: "Max",
            pro: "Pro",
            free: "Free",
            monthly: "شهرياً",
            yearly: "سنوياً",
            month: "شهر",
            year: "سنة",
            subscribe: (p: string) => `اشترك في ${p}`,
          }
        : {
            heroA: "One AI Platform.",
            heroB: "Infinity",
            heroC: "possibilities.",
            max: "Max",
            pro: "Pro",
            free: "Free",
            monthly: "Monthly",
            yearly: "Yearly",
            month: "mo",
            year: "yr",
            subscribe: (p: string) => `Get ${p}`,
          },
    [isAr],
  );

  // ---------- Pricing (USD) ----------
  // Pro  monthly: $7  (was $25, -72%)  · Pro  yearly: $149 (was $298, -50%)
  // Max  monthly: $39 (was $78, -50%)  · Max  yearly: $299 (was $598, -50%)
  type PriceBlock = { price: string; strike: string; discount: string };
  const priceMap: Record<"pro" | "max", { monthly: PriceBlock; yearly: PriceBlock }> = {
    pro: {
      monthly: { price: "5", strike: "20", discount: "-75%" },
      yearly: { price: "149", strike: "298", discount: "-50%" },

    },
    max: {
      monthly: { price: "39", strike: "78", discount: "-50%" },
      yearly: { price: "299", strike: "598", discount: "-50%" },
    },
  };
  const currentPrices = priceMap[plan];

  const activeTier: PlanTier = plan === "pro" ? "pro" : "elite";
  const isLoading = loadingTier === activeTier;

  const isLight = useIsLightTheme();
  const c = isLight
    ? {
        bg: "radial-gradient(120% 60% at 50% 0%, #f5f5f7 0%, #ffffff 55%, #ffffff 100%)",
        text: "#0a0a0a",
        textMuted: "#4b5563",
        textFaint: "#6b7280",
        subtle: "rgba(0,0,0,0.05)",
        border: "rgba(0,0,0,0.08)",
        divider: "rgba(0,0,0,0.07)",
        rowDivider: "rgba(0,0,0,0.07)",
        toggleBg: "rgba(0,0,0,0.06)",
        toggleActiveBg: "#0e0e0e",
        toggleActiveText: "#ffffff",
        toggleIdleText: "#0a0a0a",
        cardBg: "rgba(0,0,0,0.03)",
        selectedBg: "rgba(0,0,0,0.05)",
        selectedBorder: "rgba(0,0,0,0.55)",
        marqueeEdge: "#ffffff",
        ctaBg: "#0e0e0e",
        ctaText: "#ffffff",
        logoFilter: "brightness(0) saturate(100%)",
        heroItalic: "#525252",
      }
    : {
        bg: "radial-gradient(120% 60% at 50% 0%, #0b0b0b 0%, #000 55%, #000 100%)",
        text: "#ffffff",
        textMuted: "#a3a3a3",
        textFaint: "#737373",
        subtle: "rgba(255,255,255,0.04)",
        border: "rgba(255,255,255,0.08)",
        divider: "rgba(255,255,255,0.07)",
        rowDivider: "rgba(255,255,255,0.07)",
        toggleBg: "rgba(255,255,255,0.08)",
        toggleActiveBg: "#f5f5f5",
        toggleActiveText: "#0a0a0a",
        toggleIdleText: "#f5f5f5",
        cardBg: "rgba(255,255,255,0.05)",
        selectedBg: "rgba(255,255,255,0.06)",
        selectedBorder: "rgba(255,255,255,0.92)",
        marqueeEdge: "#000000",
        ctaBg: "#f5f5f5",
        ctaText: "#0a0a0a",
        logoFilter: "brightness(0) invert(1) saturate(100%)",
        heroItalic: "#d4d4d4",
      };

  const visibleFeatures = features.slice(0, 6);
  const planLabel = plan === "pro" ? t.pro : t.max;

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="relative flex h-[100dvh] w-full flex-col overflow-hidden"
      style={{
        background: isLight ? "#ffffff" : "#0d0d0d",
        backgroundImage: isLight
          ? "radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)"
          : "radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
        color: c.text,
        fontFamily: 'Inter, -apple-system, "SF Pro Text", system-ui, sans-serif',
      }}
    >
      {/* Header: sidebar button + serif title */}
      <div
        className="relative shrink-0 px-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 10px)" }}
      >
        <div className="absolute start-2 top-[calc(env(safe-area-inset-top,0px)+8px)]">
          <MobileSidebarButton
            onClick={() => onMenuClick?.()}
            ariaLabel="Menu"
            className={isLight ? "!text-black" : "!text-white"}
          />
        </div>
        <h1
          className="px-12 pt-4 text-center font-normal leading-tight"
          style={{
            color: c.text,
            fontFamily: '"Instrument Serif", "Fraunces", Georgia, serif',
            fontSize: "clamp(21px, 6.2vw, 26px)",
            letterSpacing: "-0.01em",
          }}
        >
          {isAr ? `قم بالترقية إلى Megsy ${planLabel}` : `Upgrade to Megsy ${planLabel}`}
        </h1>

        <div className="mt-3 flex justify-center">
          <div className="flex items-center rounded-full p-[3px]" style={{ background: c.toggleBg }}>
            {(["pro", "max"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlan(p)}
                className="h-7 min-w-[62px] rounded-full px-3.5 text-[12px] font-medium transition-colors"
                style={{
                  background: plan === p ? c.toggleActiveBg : "transparent",
                  color: plan === p ? c.toggleActiveText : c.toggleIdleText,
                }}
              >
                {p === "pro" ? t.pro : t.max}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Features card */}
      <div className="mt-4 px-4">
        <div
          className="rounded-[20px] px-5 py-4"
          style={{ background: isLight ? "rgba(0,0,0,0.04)" : "#262626" }}
        >
          <ul className="flex flex-col gap-[14px]">
            {visibleFeatures.map((f, i) => {
              const Icon = f.icon;
              return (
                <li key={i} className="flex items-center gap-4">
                  <Icon className="h-[19px] w-[19px] shrink-0" style={{ color: c.text }} strokeWidth={1.5} />
                  <span className="min-w-0 flex-1 truncate text-[14px]" style={{ color: c.text }}>
                    {f.title}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="min-h-[10px] flex-1" />

      {/* Plan rows */}
      <div className="shrink-0 px-4">
        {([
          { yearly: false, label: t.monthly, block: currentPrices.monthly, unit: t.month },
          { yearly: true, label: t.yearly, block: currentPrices.yearly, unit: t.year },
        ] as const).map((opt) => {
          const selected = isYearly === opt.yearly;
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => onToggleYearly(opt.yearly)}
              className="mb-2.5 flex w-full items-center gap-3.5 rounded-[16px] px-4 py-3 text-start transition-all duration-200"
              style={{
                background: isLight ? "rgba(0,0,0,0.04)" : "#1c1c1c",
                border: `2px solid ${selected ? c.selectedBorder : "transparent"}`,
              }}
            >
              <span
                className="flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-full"
                style={{ border: `2px solid ${selected ? c.text : c.textFaint}` }}
              >
                {selected && <span className="h-[9px] w-[9px] rounded-full" style={{ background: c.text }} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-[13px]" style={{ color: c.textMuted }}>
                    {opt.label}
                  </span>
                  {!opt.yearly && (
                    <span
                      className="rounded-md px-2 py-[1.5px] text-[11px] font-medium"
                      style={{ background: "#2c4a72", color: "#dbe8f8" }}
                    >
                      {isAr ? "خصم 50% على الشهر الأول" : "50% off first month"}
                    </span>
                  )}
                </span>
                <span className="mt-[3px] flex items-baseline gap-2 tabular-nums" dir="ltr">
                  <span className="text-[17px] font-semibold" style={{ color: c.text }}>
                    ${opt.block.price}
                  </span>
                  <span className="text-[13px] line-through" style={{ color: c.textFaint }}>
                    ${opt.block.strike}
                  </span>
                  <span className="text-[13px]" style={{ color: c.textMuted }}>
                    /{opt.unit}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Footnote + CTA */}
      <div
        className="shrink-0 px-4 pt-1"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
      >
        <p className="mb-2.5 text-center text-[11.5px] leading-snug" style={{ color: c.textFaint }}>
          {isAr
            ? `‏$${currentPrices.monthly.price} للشهر الأول، ثم $${currentPrices.monthly.strike}/شهر. يمكن الإلغاء في أي وقت.`
            : `$${currentPrices.monthly.price} for the first month, then $${currentPrices.monthly.strike}/mo. Cancel anytime.`}
        </p>
        <button
          type="button"
          onClick={() => onSubscribe(activeTier)}
          disabled={isLoading}
          className="flex h-[48px] w-full items-center justify-center rounded-[14px] text-[15px] font-medium transition active:scale-[0.99] disabled:opacity-60"
          style={{ background: c.ctaBg, color: c.ctaText }}
        >
          {isLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
          ) : (
            <span style={{ color: c.ctaText }}>{isAr ? "قم بالترقية الآن" : "Upgrade now"}</span>
          )}
        </button>
        <div className="mt-2.5 flex items-center justify-center gap-6 text-[12px]" style={{ color: c.textFaint }}>
          <a href="/terms">{isAr ? "الشروط" : "Terms"}</a>
          <a href="/privacy">{isAr ? "الخصوصية" : "Privacy"}</a>
          <button type="button" onClick={() => onSubscribe(activeTier)}>
            {isAr ? "استعادة" : "Restore"}
          </button>
        </div>
      </div>
    </div>
  );
}


