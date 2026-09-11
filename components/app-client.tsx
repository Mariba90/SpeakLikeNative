"use client";
import { useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import { FeedbackDashboard } from "@/components/feedback-dashboard";
import { Landing } from "@/components/landing";
import { RecordingStudio } from "@/components/recording-studio";
import type { Feedback } from "@/types/feedback";

export function AppClient({ initialAuthenticated }: { initialAuthenticated: boolean }) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [practice, setPractice] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const logout = async () => { await fetch("/api/auth/logout", { method: "POST" }); setAuthenticated(false); setPractice(false); setFeedback(null); };
  if (!authenticated) return <AuthGate onAuthenticated={() => setAuthenticated(true)} />;
  const start = () => { setPractice(true); setTimeout(() => document.getElementById("practice")?.scrollIntoView({ behavior: "smooth" }), 50); };
  return <><Landing onStart={start} onLogout={logout}/>{practice && <RecordingStudio onFeedback={f => { setFeedback(f); setTimeout(() => document.getElementById("feedback")?.scrollIntoView({ behavior: "smooth" }), 50); }}/>} {feedback && <FeedbackDashboard feedback={feedback} onNewRecording={() => { setFeedback(null); setPractice(true); setTimeout(() => document.getElementById("practice")?.scrollIntoView({ behavior: "smooth" }), 50); }}/>}</>;
}