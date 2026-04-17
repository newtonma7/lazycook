import Link from "next/link";

const ingredients = [
  { name: "tomatoes", cls: "bg-tomato/10 text-tomato" },
  { name: "basil", cls: "bg-sage/12 text-sage" },
  { name: "turmeric", cls: "bg-turmeric/12 text-turmeric" },
  { name: "eggplant", cls: "bg-eggplant/10 text-eggplant" },
  { name: "peaches", cls: "bg-peach/20 text-ink-light" },
  { name: "garlic", cls: "bg-olive/12 text-olive" },
  { name: "lemons", cls: "bg-lemon/12 text-turmeric" },
  { name: "thyme", cls: "bg-sage/15 text-sage" },
  { name: "raspberries", cls: "bg-berry/10 text-berry" },
];

const steps = [
  {
    num: "1",
    color: "bg-tomato/10",
    numColor: "text-tomato",
    title: "Stock your pantry",
    body: "Add ingredients you have on hand. We track quantities, purchase dates, and freshness so nothing goes to waste.",
  },
  {
    num: "2",
    color: "bg-sage/10",
    numColor: "text-sage",
    title: "Find recipes",
    body: "We match your pantry against a curated collection of recipes to show you exactly what you can cook right now.",
  },
  {
    num: "3",
    color: "bg-turmeric/10",
    numColor: "text-turmeric",
    title: "Start cooking",
    body: "Follow simple, tailored recipes built around what\u2019s in your kitchen. Less waste, more taste, zero stress.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-cream selection:bg-tomato/20 selection:text-ink">
      {/* ─── Vignette overlay ─── */}
      <div
        className="pointer-events-none fixed inset-0 z-20"
        aria-hidden="true"
        style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(42,33,24,0.12) 100%)" }}
      />

      {/* ─── Navbar ─── */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 md:px-16 lg:px-24">
        <span className="font-display text-2xl italic text-ink tracking-tight select-none">
          lazycook
        </span>
        <Link
          href="/dashboard?tab=pantry"
          className="group flex items-center gap-2 rounded-full border border-ink/12 bg-cream/80 backdrop-blur-sm px-5 py-2.5 font-body text-sm text-ink transition-all duration-300 hover:bg-ink hover:text-cream hover:border-ink"
        >
          open pantry
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5">&rarr;</span>
        </Link>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[88vh] px-8 text-center">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute top-[12%] -left-28 w-120 h-120 rounded-full bg-tomato/10 blur-[100px] animate-blob" />
          <div className="absolute top-[22%] -right-36 w-xl h-144 rounded-full bg-sage/10 blur-[110px] animate-blob [animation-delay:3.5s]" />
          <div className="absolute bottom-[12%] left-[28%] w-104 h-104 rounded-full bg-turmeric/10 blur-[100px] animate-blob [animation-delay:7s]" />
          <div className="absolute top-[48%] right-[18%] w-80 h-80 rounded-full bg-eggplant/10 blur-[90px] animate-blob [animation-delay:5s]" />
          <div className="absolute bottom-[28%] -left-12 w-64 h-64 rounded-full bg-peach/10 blur-[80px] animate-blob [animation-delay:8.5s]" />
        </div>

        {/* Hero content */}
        <div className="relative max-w-3xl">

          <h1 className="font-display text-[clamp(3.8rem,9vw,8.5rem)] font-light italic leading-[0.9] text-ink tracking-tight animate-slide-up [animation-delay:0.15s] bottom-2">
            lazycook
          </h1>
          <p className="mt-4 font-display text-[clamp(1.6rem,4vw,3rem)] font-light leading-[1.1] text-ink tracking-tight animate-slide-up [animation-delay:0.25s]">
            cook with what <em className="text-tomato">you already have</em>
          </p>

          <p className="mt-8 mx-auto max-w-lg font-body text-lg leading-relaxed text-ink-light animate-slide-up [animation-delay:0.3s]">
            Log your pantry ingredients, discover matching recipes,
            and never wonder what&apos;s for dinner again.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up [animation-delay:0.45s]">
            <Link
              href="/dashboard?tab=pantry"
              className="rounded-full bg-ink px-8 py-3.5 font-body text-sm font-medium text-cream tracking-wide transition-all duration-300 hover:bg-ink-light hover:shadow-lg hover:shadow-ink/10 hover:-translate-y-0.5"
            >
              Open your pantry
            </Link>
            <a
              href="#how-it-works"
              className="rounded-full border border-ink/12 px-8 py-3.5 font-body text-sm font-medium text-ink tracking-wide transition-all duration-300 hover:bg-ink/4"
            >
              See how it works
            </a>
          </div>
        </div>

        {/* Ingredient carousel */}
        <div className="absolute bottom-6 inset-x-0 overflow-hidden mask-x" aria-hidden="true">
          <div className="flex w-max gap-4 animate-marquee">
            {[...ingredients, ...ingredients, ...ingredients, ...ingredients].map((item, i) => (
              <span
                key={`pill-${i}`}
                className={`shrink-0 rounded-full px-5 py-2 font-body text-xs tracking-wide whitespace-nowrap ${item.cls}`}
              >
                {item.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Divider ─── */}
      <div className="mx-auto w-full max-w-4xl px-8 -mt-1">
        <div className="h-px bg-linear-to-r from-transparent via-border to-transparent" />
      </div>

      {/* ─── How it works ─── */}
      <section id="how-it-works" className="relative z-10 flex min-h-screen flex-col items-center justify-center px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-center font-body text-[0.8rem] tracking-[0.25em] uppercase text-ink-muted mb-4">
            Simple as 1, 2, 3
          </p>
          <h2 className="text-center font-display text-[clamp(2.4rem,5vw,3.8rem)] font-light text-ink tracking-tight mb-20">
            How it works
          </h2>

          <div className="grid gap-16 md:grid-cols-3 md:gap-10">
            {steps.map((step) => (
              <div key={step.num} className="text-center md:text-left group">
                <div className={`mx-auto md:mx-0 mb-6 flex h-14 w-14 items-center justify-center rounded-full ${step.color} transition-transform duration-300 group-hover:scale-110`}>
                  <span className={`font-display text-2xl ${step.numColor}`}>{step.num}</span>
                </div>
                <h3 className="font-display text-2xl text-ink mb-3 tracking-tight">{step.title}</h3>
                <p className="font-body text-sm leading-relaxed text-ink-light">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Divider ─── */}
      <div className="mx-auto w-full max-w-4xl px-8">
        <div className="h-px bg-linear-to-r from-transparent via-border to-transparent" />
      </div>

      {/* ─── CTA section ─── */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-8 text-center">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-[clamp(2.4rem,5vw,4.2rem)] font-light text-ink tracking-tight mb-6 leading-[1.05]">
            Ready to cook
            <br />
            <em className="text-sage">smarter?</em>
          </h2>
          <p className="font-body text-lg text-ink-light mb-12 max-w-md mx-auto leading-relaxed">
            Your pantry is waiting. Start logging ingredients
            and discover what you can make tonight.
          </p>
          <Link
            href="/dashboard?tab=pantry"
            className="inline-block rounded-full bg-ink px-10 py-4 font-body text-sm font-medium text-cream tracking-wide transition-all duration-300 hover:bg-ink-light hover:shadow-lg hover:shadow-ink/10 hover:-translate-y-0.5"
          >
            Get started &mdash; it&apos;s free
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 border-t border-border-light px-8 py-14">
        <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-display text-xl italic text-ink-muted select-none">
            lazycook
          </span>
          <p className="font-body text-xs text-ink-muted tracking-wide">
            a pantry-first recipe app &mdash; built for lazy cooks everywhere
          </p>
        </div>
      </footer>
    </div>
  );
}
