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
import { Check, Minus } from "lucide-react";
import { MobileSidebarButton } from "@/components/shared/MobileSidebarButton";
import { BrandIcon } from "@/components/chat/media/BrandIcon";
import { useUserLang } from "@/lib/authI18n";
import { type PlanTier } from "@/data/pricingData";
import megsyLogo from "@/assets/megsy-project-logo.png";

interface Props {
  isYearly: boolean;
  onToggleYearly: (yearly: boolean) => void;
  onSubscribe: (tier: PlanTier) => void;
  loadingTier?: PlanTier | null;
  onMenuClick?: () => void;
}

const MODELS = [
  { name: "Claude Opus 4.8", brand: "claude" },
  { name: "GPT-5.5", brand: "openai" },
  { name: "Gemini 3.5", brand: "gemini" },
  { name: "Qwen 3 Max", brand: "qwen" },
  { name: "Grok 4", brand: "grok" },
  { name: "Seedance Pro", brand: "seedance" },
  { name: "Sora 2", brand: "sora" },
  { name: "Flux Pro", brand: "flux" },
];

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
        { title: "محادثة · النماذج الرائدة",     value: "yes", note: "∞",  freeValue: "limited", freeNote: "محدود" },
        { title: "بحث معمّق",                     value: "yes", note: "∞",  freeValue: "limited", freeNote: "٣/يوم" },
        { title: "Megsy Coder",                    value: "yes", note: "∞",  freeValue: "no" },
        { title: "مستندات وعروض",                 value: "yes", note: "∞",  freeValue: "limited", freeNote: "٣/يوم" },
        { title: "تعليم · مهارات · MCP",          value: "yes", note: "∞",     freeValue: "yes" },
        { title: "صور احترافية",                  value: "yes", note: "٢٤٠/شهر",   freeValue: "no" },
        { title: "فيديو سينمائي",                 value: "yes", note: "٢٤٠/شهر",   freeValue: "no" },
        { title: "أولوية وتكاملات",               value: "yes", note: "∞",     freeValue: "limited", freeNote: "قياسي" },
      ]
    : [
        { title: "Chat · flagship models",         value: "yes", note: "∞", freeValue: "limited", freeNote: "Lite" },
        { title: "Deep Research",                  value: "yes", note: "∞", freeValue: "limited", freeNote: "3/day" },
        { title: "Megsy Coder",                    value: "yes", note: "∞", freeValue: "no" },
        { title: "Docs & Slides",                  value: "yes", note: "∞", freeValue: "limited", freeNote: "3/day" },
        { title: "Study · Skills · MCP",           value: "yes", note: "∞",  freeValue: "yes" },
        { title: "Pro images",                     value: "yes", note: "240 / mo",  freeValue: "no" },
        { title: "Cinematic video",                value: "yes", note: "240 / mo",  freeValue: "no" },
        { title: "Priority & integrations",        value: "yes", note: "∞",  freeValue: "limited", freeNote: "Standard" },
      ];

  const maxFeatures: FeatureRow[] = isAr
    ? [
        { title: "محادثة · النماذج الرائدة",     value: "yes", note: "∞",  freeValue: "limited", freeNote: "محدود" },
        { title: "بحث معمّق",                     value: "yes", note: "∞",  freeValue: "limited", freeNote: "٣/يوم" },
        { title: "Megsy Coder",                    value: "yes", note: "∞",  freeValue: "no" },
        { title: "مستندات وعروض",                 value: "yes", note: "∞",  freeValue: "limited", freeNote: "٣/يوم" },
        { title: "تعليم · مهارات · MCP",          value: "yes", note: "∞",     freeValue: "yes" },
        { title: "صور احترافية",                  value: "yes", note: "∞",  freeValue: "no" },
        { title: "فيديو سينمائي",                 value: "yes", note: "٥٠٠/شهر",   freeValue: "no" },
        { title: "أولوية ×٣ وتكاملات",            value: "yes", note: "×٣ أسرع",   freeValue: "limited", freeNote: "قياسي" },
      ]
    : [
        { title: "Chat · flagship models",         value: "yes", note: "∞", freeValue: "limited", freeNote: "Lite" },
        { title: "Deep Research",                  value: "yes", note: "∞", freeValue: "limited", freeNote: "3/day" },
        { title: "Megsy Coder",                    value: "yes", note: "∞", freeValue: "no" },
        { title: "Docs & Slides",                  value: "yes", note: "∞", freeValue: "limited", freeNote: "3/day" },
        { title: "Study · Skills · MCP",           value: "yes", note: "∞",  freeValue: "yes" },
        { title: "Pro images",                     value: "yes", note: "∞", freeValue: "no" },
        { title: "Cinematic video",                value: "yes", note: "500 / mo",  freeValue: "no" },
        { title: "3× priority & integrations",     value: "yes", note: "3× faster", freeValue: "limited", freeNote: "Standard" },
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
        toggleActiveBg: "#2DDBA0",
        toggleActiveText: "#05100b",
        toggleIdleText: "#f5f5f5",
        cardBg: "rgba(255,255,255,0.04)",
        selectedBg: "rgba(255,255,255,0.07)",
        selectedBorder: "rgba(45,219,160,0.65)",
        marqueeEdge: "#000000",
        ctaBg: "#2DDBA0",
        ctaText: "#05100b",
        logoFilter: "brightness(0) invert(1) saturate(100%)",
        heroItalic: "#d4d4d4",
      };

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="relative flex h-[100dvh] w-full flex-col overflow-hidden"
      style={{
        background: c.bg,
        color: c.text,
        fontFamily: 'Inter, -apple-system, "SF Pro Text", system-ui, sans-serif',
      }}
    >
      {/* Top bar — only menu button */}
      <header
        className="flex items-center px-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 10px)", paddingBottom: 4 }}
      >
        <MobileSidebarButton
          onClick={() => onMenuClick?.()}
          ariaLabel={isAr ? "القائمة" : "Menu"}
          className={isLight ? "!text-black" : "!text-white"}
        />
      </header>

      {/* Hero copy with Megsy logo */}
      <div className="px-6 pt-8 text-center">
        <h1
          className="mx-auto font-normal leading-[1.02]"
          style={{
            color: c.text,
            fontFamily: '"Instrument Serif", "Fraunces", Georgia, serif',
            fontSize: "clamp(28px, 7.6vw, 38px)",
            letterSpacing: "-0.015em",
          }}
        >
          <span className="inline-flex items-center gap-2 whitespace-nowrap align-baseline">
            <img loading="lazy" decoding="async"
              src={megsyLogo}
              alt="Megsy"
              className="inline-block h-[0.92em] w-auto -translate-y-[2px] select-none"
              style={{
                filter: c.logoFilter,
              }}
              draggable={false}
            />
            <span>{t.heroA}</span>
          </span>
          <br />
          <span className="italic" style={{ color: c.heroItalic }}>{t.heroB}</span>{" "}
          <span>{t.heroC}</span>
        </h1>
      </div>

      {/* Models marquee */}
      <div className="relative mt-6 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-y-0 start-0 z-10 w-10"
          style={{ background: `linear-gradient(to right, ${c.marqueeEdge}, transparent)` }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 end-0 z-10 w-10"
          style={{ background: `linear-gradient(to left, ${c.marqueeEdge}, transparent)` }}
        />
        <div
          className="flex w-max items-center gap-6 whitespace-nowrap px-6"
          style={{ animation: "pricing-marquee 22s linear infinite" }}
        >
          {[...MODELS, ...MODELS].map((m, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: c.textMuted }}>
              <BrandIcon name={m.brand} size={16} variant="color" />
              <span>{m.name}</span>
            </div>
          ))}
        </div>
        <style>{`
          @keyframes pricing-marquee {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* Max / Pro toggle */}
      <div className="mt-6 flex justify-center">
        <div
          className="relative flex items-center rounded-full p-1"
          style={{ background: c.toggleBg }}
        >
          <button
            type="button"
            onClick={() => setPlan("max")}
            className="relative z-10 h-8 min-w-[64px] rounded-full px-4 text-[13px] font-medium transition-colors"
            style={{
              background: plan === "max" ? c.toggleActiveBg : "transparent",
              color: plan === "max" ? c.toggleActiveText : c.toggleIdleText,
            }}
          >
            {t.max}
          </button>
          <button
            type="button"
            onClick={() => setPlan("pro")}
            className="relative z-10 h-8 min-w-[64px] rounded-full px-4 text-[13px] font-medium transition-colors"
            style={{
              background: plan === "pro" ? c.toggleActiveBg : "transparent",
              color: plan === "pro" ? c.toggleActiveText : c.toggleIdleText,
            }}
          >
            {t.pro}
          </button>
        </div>
      </div>

      {/* Benefits card — clean neutral list, icon + label (reference design) */}
      <div className="mx-4 mt-6 flex-1 min-h-0">
        <div
          className="h-full rounded-[22px] px-4 py-3"
          style={{ background: c.cardBg, border: `1px solid ${c.border}` }}
        >
          <ul key={plan} className="flex h-full flex-col justify-around">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <li
                  key={i}
                  className="flex items-center gap-3 py-[7px]"
                  style={{
                    opacity: 0,
                    animation: "pricing-row-in 340ms cubic-bezier(0.22,1,0.36,1) forwards",
                    animationDelay: `${50 + i * 32}ms`,
                  }}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" style={{ color: c.text }} strokeWidth={1.6} />
                  <span
                    className="min-w-0 truncate text-[13.5px] font-medium leading-tight"
                    style={{ color: c.text }}
                  >
                    {f.title}
                  </span>
                </li>
              );
            })}
          </ul>
          <style>{`
            @keyframes pricing-row-in {
              from { opacity: 0; transform: translateY(6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      </div>

      {/* Billing options — stacked rows with radio (reference design) */}
      <div className="px-4 pt-5">
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
              className="mb-2.5 flex w-full items-center gap-3 rounded-[16px] px-3.5 py-3 text-start transition-all duration-200"
              style={{
                background: selected ? c.selectedBg : c.cardBg,
                border: `2px solid ${selected ? c.selectedBorder : "transparent"}`,
              }}
            >
              <span
                className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full"
                style={{ border: `2px solid ${selected ? c.text : c.textFaint}` }}
              >
                {selected && (
                  <span className="h-[10px] w-[10px] rounded-full" style={{ background: c.text }} />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-[12.5px] font-medium" style={{ color: c.textMuted }}>
                    {opt.label}
                  </span>
                  <span
                    className="rounded-full px-2 py-[1px] text-[10.5px] font-semibold"
                    style={{ background: c.subtle, color: c.textMuted }}
                  >
                    {opt.block.discount}
                  </span>
                </span>
                <span className="mt-1 flex items-baseline gap-2 tabular-nums" dir="ltr">
                  <span className="text-[15px] font-semibold" style={{ color: c.text }}>
                    ${opt.block.price}
                  </span>
                  <span className="text-[12px] line-through" style={{ color: c.textFaint }}>
                    ${opt.block.strike}
                  </span>
                  <span className="text-[11px]" style={{ color: c.textMuted }}>/{opt.unit}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Footnote + CTA + legal links */}
      <div
        className="px-4 pt-1"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
      >
        <p className="mb-2.5 text-center text-[11px] leading-snug" style={{ color: c.textFaint }}>
          {isAr
            ? `‏$${currentPrices.monthly.price} للشهر الأول، ثم $${currentPrices.monthly.strike}/شهر. يمكن الإلغاء في أي وقت.`
            : `$${currentPrices.monthly.price} for the first month, then $${currentPrices.monthly.strike}/mo. Cancel anytime.`}
        </p>
        <button
          key={plan}
          type="button"
          onClick={() => onSubscribe(activeTier)}
          disabled={isLoading}
          className="flex h-[52px] w-full items-center justify-center rounded-[14px] text-[15px] font-semibold transition active:scale-[0.99] disabled:opacity-60"
          style={{ background: c.ctaBg, color: c.ctaText }}
        >
          {isLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
          ) : (
            <span style={{ color: c.ctaText }}>
              {isAr ? "قم بالترقية الآن" : t.subscribe(plan === "pro" ? t.pro : t.max)}
            </span>
          )}
        </button>
        <div className="mt-2.5 flex items-center justify-center gap-5 text-[11.5px]" style={{ color: c.textFaint }}>
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

