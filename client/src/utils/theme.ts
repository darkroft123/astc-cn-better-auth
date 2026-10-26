export type Theme = "light" | "dark";

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
  return match ? decodeURIComponent(match[3]) : null;
}

export function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const isJoyit = window.location.hostname.includes("joyit.io");
  const maxAge = days * 24 * 60 * 60;
  
  if (isJoyit) {
    document.cookie = `${name}=${encodeURIComponent(value)}; domain=.joyit.io; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";

  // 1. URL parameter (?theme=light|dark)
  const params = new URLSearchParams(window.location.search);
  const paramTheme = params.get("theme");
  if (paramTheme === "light" || paramTheme === "dark") {
    return paramTheme;
  }

  // 2. Cookie compartida entre subdominios .joyit.io
  const cookieTheme = getCookie("theme");
  if (cookieTheme === "light" || cookieTheme === "dark") {
    return cookieTheme;
  }

  // 3. localStorage local
  const localTheme = localStorage.getItem("theme");
  if (localTheme === "light" || localTheme === "dark") {
    return localTheme;
  }

  // Por defecto LIGHT
  return "light";
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  localStorage.setItem("theme", theme);
  setCookie("theme", theme);
}
