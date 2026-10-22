"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button/Button";
import { Icon } from "@/components/ui/Icon/Icon";
import { Notice } from "@/components/ui/Notice/Notice";
import { TextField } from "@/components/ui/TextField/TextField";
import { LOGIN_ERROR_MESSAGES, submitLogin, validateLogin } from "../../login-client";
import { emitLoginMood } from "../../login-mood";
import styles from "./LoginForm.module.scss";

type Status = "idle" | "submitting" | "success";

export function LoginForm({ next, notice, submitLabel = "Sign in" }: {
  next: string | null;
  notice?: string;
  submitLabel?: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (inFlight.current) return;

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const errors = validateLogin(email, password);
    setFieldErrors(errors);
    setFormError(null);
    if (errors.email) return emailRef.current?.focus();
    if (errors.password) return passwordRef.current?.focus();

    inFlight.current = true;
    setStatus("submitting");
    emitLoginMood({ mood: "thinking" });
    const outcome = await submitLogin({ email: email.trim(), password }, next);
    if (outcome.ok) {
      setStatus("success");
      emitLoginMood({ mood: "success" });
      router.replace(outcome.redirectTo);
      router.refresh();
      return; // keep the lock until navigation completes
    }
    inFlight.current = false;
    setStatus("idle");
    setFormError(LOGIN_ERROR_MESSAGES[outcome.error]);
    emitLoginMood({ mood: "error" });
    passwordRef.current?.select();
  }

  const busy = status !== "idle";
  // The robot only learns where focus is and how long the email is, never what was typed.
  const lookAlong = (el: HTMLInputElement) => Math.min(1, (el.selectionStart ?? el.value.length) / 32);
  const leave = (e: React.FocusEvent<HTMLFormElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) emitLoginMood({ mood: "idle" });
  };

  return (
    <form onSubmit={onSubmit} noValidate aria-busy={busy} className={styles.form} onBlur={leave}>
      {notice && <Notice variant="info">{notice}</Notice>}
      <div aria-live="assertive">{formError && <Notice variant="error">{formError}</Notice>}</div>

      <TextField
        ref={emailRef}
        id="email"
        name="email"
        type="email"
        label="Work email"
        autoComplete="username"
        inputMode="email"
        placeholder="you@company.com"
        disabled={busy}
        error={fieldErrors.email}
        onFocus={(e) => emitLoginMood({ mood: "email", look: lookAlong(e.currentTarget) })}
        onInput={(e) => emitLoginMood({ mood: "email", look: lookAlong(e.currentTarget) })}
      />

      <TextField
        ref={passwordRef}
        id="password"
        name="password"
        type={showPassword ? "text" : "password"}
        label="Password"
        autoComplete="current-password"
        disabled={busy}
        error={fieldErrors.password}
        onFocus={() => emitLoginMood({ mood: showPassword ? "peek" : "password" })}
        trailing={
          <button
            type="button"
            className={styles.toggle}
            onClick={() => { emitLoginMood({ mood: showPassword ? "password" : "peek" }); setShowPassword((v) => !v); }}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            disabled={busy}
          >
            <Icon name={showPassword ? "visibility_off" : "visibility"} />
          </button>
        }
      />

      <Button type="submit" fullWidth disabled={busy} loading={status === "submitting"}>
        {status === "idle" && submitLabel}
        {status === "submitting" && "Signing in…"}
        {status === "success" && "Signed in — redirecting…"}
      </Button>
    </form>
  );
}
