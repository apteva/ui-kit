// @apteva/ui-kit — shared visual primitives for chat-attachment and
// dashboard-panel components. Apps and integrations import from this
// barrel; the dashboard ships the bundle once and exposes it via the
// browser importmap so component authors get the same versions and
// the wire size stays small.

export { Card } from "./Card";
export { CardHeader } from "./CardHeader";
export type { CardHeaderProps, CardVendor } from "./CardHeader";
export { AppCardHeader } from "./AppCardHeader";
export type { AppCardHeaderProps } from "./AppCardHeader";
export { AppIcon, AppIdentityProvider, useAppIdentity } from "./AppIdentity";
export type {
  AppIconProps,
  AppIconSize,
  AppIconStyle,
  AppIdentity,
  AppIdentityProviderProps,
} from "./AppIdentity";
export { useColorMode } from "./useColorMode";
export type { ColorMode } from "./useColorMode";
export { StatusDot } from "./StatusDot";
export type { StatusDotVariant } from "./StatusDot";
export { StatusPill } from "./StatusPill";
export type { StatusPillVariant } from "./StatusPill";
export { Avatar, AvatarStack } from "./Avatar";
export { DataList } from "./DataList";
export { KPI } from "./KPI";
export type { KPITone } from "./KPI";
export { Row } from "./Row";
export { Timeline } from "./Timeline";
export type { TimelineEvent, TimelineTone } from "./Timeline";

export { AgentMark, AGENT_ICONS, AGENT_ICON_COLORS, suggestedAgentIcon } from "./AgentMark";
export type { AgentIconId, AgentIconColor } from "./AgentMark";
