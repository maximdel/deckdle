import { useId } from "react";

interface Props {
  value?: number | string;
  size?: number;
  dim?: boolean;
}

/** An elixir drop with a number in it (own drawing, not a game asset). */
export function ElixirDrop({ value, size = 26, dim = false }: Props) {
  // useId output can contain characters that break url(#id), so keep it plain.
  const gradient = "drop" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={`drop${dim ? " drop--dim" : ""}`} style={{ width: size, height: size * 1.2 }} aria-hidden={value === undefined}>
      <svg viewBox="0 0 20 24" width={size} height={size * 1.2}>
        <defs>
          <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f78ff0" />
            <stop offset="1" stopColor="#a02bbf" />
          </linearGradient>
        </defs>
        <path d="M10 1.5C10 1.5 2 10.5 2 15.5a8 8 0 0 0 16 0C18 10.5 10 1.5 10 1.5Z" fill={`url(#${gradient})`} stroke="#4a0f5c" strokeWidth="1.5" />
        <ellipse cx="6.8" cy="13.5" rx="1.6" ry="2.6" fill="#fff" opacity=".55" />
      </svg>
      {value !== undefined && <span className="drop__value">{value}</span>}
    </span>
  );
}
