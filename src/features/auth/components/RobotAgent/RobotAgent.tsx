"use client";

import { useEffect, useState } from "react";
import { onLoginMood, type LoginMood } from "../../login-mood";
import { Robot } from "./Robot";

const LINES: Partial<Record<LoginMood, string>> = {
  email: "I'll keep an eye on that email.",
  password: "Not peeking, promise.",
  peek: "Okay… just a tiny peek.",
  thinking: "Checking with the server…",
  error: "Hmm, that didn't work. Check your email and password.",
  success: "Welcome back! Taking you in.",
};
const POKES = [
  "Hi, I'm Pilot. I help your team understand failed pipelines.",
  "Every fix I suggest still needs a human's approval.",
  "Your role decides what you can see after you sign in.",
] as const;

/** Pilot on the sign-in page: follows the form through the login-mood channel. */
export function RobotAgent() {
  const [state, setState] = useState<{ mood: LoginMood; look?: number }>({ mood: "idle" });
  useEffect(() => onLoginMood(({ mood, look }) => setState({ mood, look })), []);
  return <Robot mood={state.mood} look={state.look} line={LINES[state.mood] ?? null} pokes={POKES} />;
}
