// CardHeader — the strip at the top of every Card.
//
// Two visual layouts:
//
//   With `vendor` set (every integration card):
//
//     ┌──────────────────────────────────────────────────────────┐
//     │  [HUBSPOT pill]                                          │  ← brand row
//     ├──────────────────────────────────────────────────────────┤
//     │  Sales pipeline                  ● live   View ↗         │  ← title row
//     │  11 open · $653,000 weighted                             │
//     └──────────────────────────────────────────────────────────┘
//
//     The pill on its own row guarantees the title row has full
//     width for title + subtitle + status + action — no truncation
//     even on a 480px-wide chat-attachment card.
//
//   Without `vendor` (legacy single-row, kept for backward compat):
//
//     [logo]  title              ● status         action ↗
//
// Why two rows: a 480px card was running out of room with
// [pill][title][status][action] all in one line. Stacking the pill
// gives back ~80px of title room and makes brand identity more
// prominent (the pill becomes a header strip in its own right).

import type { CSSProperties, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { StatusDot, type StatusDotVariant } from "./StatusDot";
import { useColorMode, type ColorMode } from "./useColorMode";

export interface CardVendor {
  /** Display name shown in the brand pill — e.g. "HubSpot". */
  name: string;
  /** Inline logo node — usually an <svg> using currentColor. */
  logo?: ReactNode;
  /** Brand color. Two shapes:
   *
   *    string                       — same color in light + dark
   *    { light: "...", dark: "..." } — separate value per mode
   *
   *  The dual form is for vendors whose brand is too dark or too
   *  light to read across both modes. Notion (`#191919` near-black)
   *  is unreadable on a dark card, so it ships {light, dark} where
   *  the dark variant is white. Bright brands (HubSpot orange,
   *  GitHub Mona Purple) stay as a single string. */
  color?: string | { light: string; dark: string };
}

export interface CardHeaderProps {
  /** Legacy single-line logo slot. Ignored when `vendor` is set. */
  logo?: ReactNode;
  /** Vendor branding — renders as a brand row above the title. */
  vendor?: CardVendor;
  /** Primary line — usually the entity name. */
  title: ReactNode;
  /** Secondary line under the title (counts, breadcrumbs, etc.). */
  subtitle?: ReactNode;
  /** Right-side status dot + label, e.g. "live", "open", "merged". */
  status?: { label: string; variant?: StatusDotVariant };
  /** Right-side trailing affordance, e.g. "View on GitHub →". */
  action?: { label: string; href: string };
  /** Arbitrary right-side controls for app cards that need more than
   * the standard status/action pair. */
  right?: ReactNode;
}

export function CardHeader({ logo, vendor, title, subtitle, status, action, right }: CardHeaderProps) {
  // Subscribe to the dashboard's data-mode attribute so the vendor
  // pill picks the right brand color when the mode flips. Cheap —
  // the hook is a single MutationObserver shared across CardHeaders.
  const mode = useColorMode();

  if (vendor) {
    return (
      <div className="border-b border-border">
        {/* Brand row — vendor pill on its own line, plus optional
            action on the right. Compact vertical space (pt-2.5 pb-1
            ≈ 28px row) so it adds presence without adding bulk. */}
        <div className="flex items-center justify-between gap-2 px-4 pt-2.5 pb-1">
          <VendorPill vendor={vendor} mode={mode} />
          <div className="flex shrink-0 items-center gap-2">
            {right}
            {action && <HeaderAction action={action} />}
          </div>
        </div>
        {/* Title row — full width for the entity name + subtitle on
            the left, status dot on the right. Padding tuned to feel
            visually balanced under the brand row. */}
        <div className="flex items-center gap-3 px-4 pt-1 pb-3">
          <div className="min-w-0 flex-1 flex flex-col">
            <div className="text-text text-sm font-semibold truncate leading-tight">
              {title}
            </div>
            {subtitle && (
              <div className="text-text-dim text-xs truncate mt-0.5 leading-tight">
                {subtitle}
              </div>
            )}
          </div>
          {status && <StatusDot variant={status.variant}>{status.label}</StatusDot>}
        </div>
      </div>
    );
  }

  // Legacy single-row layout — for cards that haven't migrated to
  // the vendor pattern (or non-integration use cases).
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
      {logo && (
        <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-text-dim">
          {logo}
        </span>
      )}
      <div className="min-w-0 flex-1 flex flex-col">
        <div className="text-text text-sm font-semibold truncate leading-tight">
          {title}
        </div>
        {subtitle && (
          <div className="text-text-dim text-xs truncate mt-0.5 leading-tight">
            {subtitle}
          </div>
        )}
      </div>
      {status && <StatusDot variant={status.variant}>{status.label}</StatusDot>}
      {right}
      {action && <HeaderAction action={action} />}
    </div>
  );
}

function VendorPill({ vendor, mode }: { vendor: CardVendor; mode: ColorMode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 flex-shrink-0 px-2 py-0.5 rounded-md text-[11px] uppercase tracking-wider font-semibold whitespace-nowrap"
      style={vendorPillStyle(vendor, mode)}
      title={vendor.name}
    >
      {vendor.logo && (
        <span className="w-3 h-3 inline-flex items-center justify-center">{vendor.logo}</span>
      )}
      {vendor.name}
    </span>
  );
}

function HeaderAction({ action }: { action: { label: string; href: string } }) {
  return (
    <a
      href={action.href}
      target="_blank"
      rel="noopener"
      className="flex-shrink-0 inline-flex items-center gap-0.5 text-xs font-medium text-text-dim hover:text-text whitespace-nowrap transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
      {action.label}
      <ArrowUpRight className="w-3.5 h-3.5" />
    </a>
  );
}

function vendorPillStyle(vendor: CardVendor, mode: ColorMode): CSSProperties {
  if (!vendor.color) return {};
  // Pick a single concrete color — string brands use it everywhere,
  // {light, dark} brands pick the right one for the active mode.
  const color = typeof vendor.color === "string" ? vendor.color : vendor.color[mode];
  if (!color) return {};
  // Tinted background: append 14 alpha (~8%) so the pill reads as a
  // soft halo of the brand color without competing with the title.
  // Hex-only fallback — non-hex colors keep the foreground tint and
  // lose the bg, which is a fine degraded state.
  const isHex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color);
  return isHex
    ? { color, backgroundColor: color + "1F" } // ≈12% — bumped from 8% for legibility on glass surfaces
    : { color };
}
