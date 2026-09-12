"use client";

import { useState } from "react";
import { FeedbackDashboard } from "@/components/feedback-dashboard";
import { Landing } from "@/components/landing";
import { RecordingStudio } from "@/components/recording-studio";
import type { AppUser } from "@/lib/users";
import type { Feedback } from "@/types/feedback";

export function AppClient({ user }: { user: AppUser }) {
  const [practice, setPractice] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/");
  };
  const start = () => {
    setPractice(true);
    setTimeout(() => document.getElementById("practice")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return <>
    <Landing onStart={start} onLogout={logout} isAdmin={user.role === "admin"} />
    {practice && <RecordingStudio onFeedback={(nextFeedback) => {
      setFeedback(nextFeedback);
      setTimeout(() => document.getElementById("feedback")?.scrollIntoView({ behavior: "smooth" }), 50);
    }} />}
    {feedback && <FeedbackDashboard feedback={feedback} onNewRecording={() => {
      setFeedback(null);
      setPractice(true);
      setTimeout(() => document.getElementById("practice")?.scrollIntoView({ behavior: "smooth" }), 50);
    }} />}
  </>;
}
