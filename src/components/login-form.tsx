"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions";

export function LoginForm() {
  const [error, formAction, pending] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-stone-700">Demo email</span>
        <input className="focus-ring mt-1 w-full rounded border border-stone-300 px-3 py-2" name="email" type="email" defaultValue="admin@saicc.local" />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-stone-700">Password</span>
        <input className="focus-ring mt-1 w-full rounded border border-stone-300 px-3 py-2" name="password" type="password" defaultValue="SprintPark!2026" />
      </label>
      {error ? <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <button className="focus-ring w-full rounded bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-800" disabled={pending}>
        {pending ? "Signing in..." : "Enter SAICC"}
      </button>
    </form>
  );
}
