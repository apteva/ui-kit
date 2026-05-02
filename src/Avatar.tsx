// Avatar — circular image with a fallback monogram. Used in card
// headers, timeline rows, and AvatarStack. Falls back to the first
// letter of `name` rendered on a muted background when `src` fails or
// is absent — never shows a broken image.

import { useState } from "react";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: number;
  title?: string;
}

export function Avatar({ src, name, size = 16, title }: AvatarProps) {
  const [broken, setBroken] = useState(false);
  const useImage = src && !broken;
  const monogram = (name || "?").trim().charAt(0).toUpperCase() || "?";
  const style = { width: size, height: size, fontSize: Math.max(8, size * 0.5) };
  if (useImage) {
    return (
      <img
        src={src}
        alt={name}
        title={title || name}
        onError={() => setBroken(true)}
        className="rounded-full object-cover flex-shrink-0 bg-bg-input"
        style={style}
      />
    );
  }
  return (
    <span
      title={title || name}
      style={style}
      className="rounded-full flex items-center justify-center bg-bg-input text-text-muted font-medium flex-shrink-0"
    >
      {monogram}
    </span>
  );
}

interface AvatarStackProps {
  users: { src?: string | null; name: string }[];
  /** Max avatars before collapsing into a +N indicator. Default 4. */
  max?: number;
  size?: number;
}

export function AvatarStack({ users, max = 4, size = 16 }: AvatarStackProps) {
  const visible = users.slice(0, max);
  const overflow = users.length - visible.length;
  return (
    <span className="inline-flex items-center -space-x-1">
      {visible.map((u, i) => (
        <span key={i} className="ring-1 ring-bg-card rounded-full">
          <Avatar src={u.src} name={u.name} size={size} />
        </span>
      ))}
      {overflow > 0 && (
        <span
          style={{ width: size, height: size, fontSize: Math.max(8, size * 0.45) }}
          className="rounded-full flex items-center justify-center bg-bg-input text-text-dim ring-1 ring-bg-card"
        >
          +{overflow}
        </span>
      )}
    </span>
  );
}
