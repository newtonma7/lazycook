import Link from "next/link";
import { forgotPasswordAccount } from "../actions";

type ForgotPasswordPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const message = getSingleParam(params?.message);
  const error = getSingleParam(params?.error);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-black/45" aria-hidden="true" />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-password-title"
          className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl"
        >
          <h1 id="forgot-password-title" className="text-lg font-semibold text-zinc-900">
            Forgot password
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Reset your account password by entering your email and setting a new password.
          </p>

          {error ? (
            <p className="mt-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          ) : null}

          {message ? (
            <p className="mt-4 rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>
          ) : null}

          <form action={forgotPasswordAccount} className="mt-5 space-y-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="forgot-email" className="text-sm text-zinc-600">
                Email
              </label>
              <input
                id="forgot-email"
                name="email"
                type="email"
                required
                className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="forgot-password" className="text-sm text-zinc-600">
                New password
              </label>
              <input
                id="forgot-password"
                name="password"
                type="password"
                required
                minLength={8}
                className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
            >
              Reset password
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link
              href="/dashboard?tab=account"
              className="text-xs text-zinc-500 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-700"
            >
              Back to sign in
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
