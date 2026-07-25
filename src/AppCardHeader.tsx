import { AppIcon, useAppIdentity } from "./AppIdentity";
import { CardHeader, type CardHeaderProps } from "./CardHeader";

export type AppCardHeaderProps = Omit<CardHeaderProps, "logo" | "vendor">;

// AppCardHeader consumes identity supplied by the dashboard loader. App-owned
// cards opt into one consistent logo without importing or redrawing it.
export function AppCardHeader(props: AppCardHeaderProps) {
  const identity = useAppIdentity();
  return (
    <CardHeader
      {...props}
      logo={
        identity ? (
          <AppIcon
            src={identity.iconUrl}
            iconStyle={identity.iconStyle}
            name={identity.displayName}
            size="xs"
            framed={false}
            className="text-accent"
          />
        ) : undefined
      }
    />
  );
}
