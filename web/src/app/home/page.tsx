import Link from "next/link";
import { getCurrentAccount } from "../account-auth";
import { OrbitGraph } from "./orbit-graph";

export default async function HomePage() {
  let account: Awaited<ReturnType<typeof getCurrentAccount>> = null;
  try {
    account = await getCurrentAccount();
  } catch {
    /* Supabase may be unavailable */
  }

  return (
    <div className="relative min-h-screen bg-cream selection:bg-tomato/20 selection:text-ink">
      {/* Vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-20"
        aria-hidden="true"
        style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(42,33,24,0.12) 100%)" }}
      />

      {/* Nav overlay */}
      <nav className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-8 py-6 md:px-16">
        <div>
          <Link href="/" className="font-display text-xl italic text-ink tracking-tight hover:text-tomato transition-colors duration-300">
            lazycook
          </Link>
          {account ? (
            <p className="font-body text-xs text-ink-muted mt-0.5">
              Welcome back, {account.username ?? account.email}
            </p>
          ) : (
            <p className="font-body text-xs text-ink-muted mt-0.5">
              Your kitchen hub
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-full border border-ink/12 px-4 py-2 font-body text-xs text-ink-muted tracking-wide transition-all duration-300 hover:bg-ink hover:text-cream hover:border-ink"
          >
            &larr; Landing
          </Link>
        </div>
      </nav>

      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-[10%] -left-32 w-120 h-120 rounded-full bg-tomato/6 blur-[120px] animate-blob" />
        <div className="absolute bottom-[15%] -right-28 w-104 h-104 rounded-full bg-sage/6 blur-[110px] animate-blob [animation-delay:4s]" />
        <div className="absolute top-[50%] left-[60%] w-80 h-80 rounded-full bg-turmeric/5 blur-[100px] animate-blob [animation-delay:8s]" />
      </div>

      {/* Orbit graph */}
      <OrbitGraph />
    </div>
  );
}
