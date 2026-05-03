// @apteva/ui-kit — shared visual primitives for chat-attachment and
// dashboard-panel components. Apps and integrations import from this
// barrel; the dashboard ships the bundle once and exposes it via the
// browser importmap so component authors get the same versions and
// the wire size stays small.

export { Card } from "./Card";
export { CardHeader } from "./CardHeader";
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
