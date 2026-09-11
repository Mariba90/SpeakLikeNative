"use client";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => { const saved = localStorage.getItem("sln-theme"); const enabled = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches); setDark(enabled); document.documentElement.classList.toggle("dark", enabled); }, []);
  function toggle() { const next = !dark; setDark(next); localStorage.setItem("sln-theme", next ? "dark" : "light"); document.documentElement.classList.toggle("dark", next); }
  return <button onClick={toggle} className="grid h-10 w-10 place-items-center rounded-full text-[var(--muted)] transition hover:bg-black/5 dark:hover:bg-white/10" aria-label="Toggle color theme">{dark ? <Sun size={19}/> : <Moon size={19}/>}</button>;
}
