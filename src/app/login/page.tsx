import { Bot } from "lucide-react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f8f5] px-4">
      <section className="w-full max-w-md rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded bg-brand text-white">
            <Bot size={24} aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-normal">SprintPark AI Command Center</h1>
            <p className="text-sm text-stone-500">SAICC Milestone 1 vertical slice</p>
          </div>
        </div>
        <LoginForm />
        <div className="mt-6 rounded border border-stone-200 bg-stone-50 p-3 text-xs text-stone-600">
          <p className="font-semibold text-stone-700">Demo users</p>
          <p>admin@saicc.local, executive@saicc.local, security@saicc.local, finance@saicc.local, department@saicc.local</p>
          <p className="mt-2">Password: SprintPark!2026</p>
        </div>
      </section>
    </main>
  );
}
