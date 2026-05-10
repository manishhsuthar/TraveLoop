import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Compass, Sparkles, Map, Wallet, Backpack } from "lucide-react";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Traveloop — Intelligent India travel planner" },
      {
        name: "description",
        content:
          "Plan India-focused multi-city itineraries with INR budgets, AI suggestions, and shareable trip pages.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="absolute left-0 right-0 top-0 z-20">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 text-primary-foreground">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary-foreground/15 backdrop-blur">
              <Compass className="h-5 w-5" />
            </div>
            <span className="font-serif text-2xl font-semibold tracking-tight">Traveloop</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild className="bg-primary-foreground text-ink hover:bg-primary-foreground/90">
              <Link to="/signup">Get started</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative h-[92vh] min-h-[640px] overflow-hidden">
        <img
          src={hero}
          alt="Traveler at sunrise above the clouds"
          width={1600}
          height={1024}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/70" />
        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-end px-6 pb-20 text-primary-foreground">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs uppercase tracking-[0.3em] text-primary-foreground/80"
          >
            India-first intelligent travel planning
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 max-w-4xl font-serif text-5xl font-semibold leading-[1.05] text-balance md:text-7xl"
          >
            Plan Indian trips with real budgets and smarter routes.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-5 max-w-xl text-lg text-primary-foreground/85"
          >
            Compose Goa escapes, Rajasthan heritage loops, Himachal roadtrips, and Kerala breaks with INR budgets and live backend data.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button asChild size="lg" className="rounded-full bg-primary-foreground text-ink hover:bg-primary-foreground/90">
              <Link to="/signup">
                Start planning <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <Link to="/share/$slug" params={{ slug: "1" }}>
                See an itinerary
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 max-w-2xl">
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Features</span>
          <h2 className="mt-3 font-serif text-4xl font-semibold md:text-5xl">
            Every chapter of your trip, in one place.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Map, title: "Itinerary builder", body: "Drag and drop multi-city stops with timeline and calendar views." },
            { icon: Wallet, title: "INR budget that adds up", body: "Track Indian activity pricing and overbudget signals with live charts." },
            { icon: Backpack, title: "Packing & journal", body: "Reusable checklists and a daily journal for the road." },
            { icon: Sparkles, title: "AI India planner", body: "Generate Goa, Rajasthan, Himachal, Kerala, or Ladakh plans in seconds." },
            { icon: Compass, title: "Shareable pages", body: "Send a beautiful read-only itinerary to friends and family." },
            { icon: Map, title: "Works on mobile", body: "Responsive, dark-mode ready, and ready when you are." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border bg-card p-6 soft-shadow">
              <f.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-4 font-serif text-2xl">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Destinations */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Destinations</span>
            <h2 className="mt-3 font-serif text-4xl font-semibold md:text-5xl">Where to next?</h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { img: "https://source.unsplash.com/900x1200/?goa,india,beach", name: "Goa", country: "India" },
            { img: "https://source.unsplash.com/900x1200/?jaipur,india,fort", name: "Jaipur", country: "India" },
            { img: "https://source.unsplash.com/900x1200/?ladakh,india,mountains", name: "Leh Ladakh", country: "India" },
            { img: "https://source.unsplash.com/900x1200/?kerala,india,backwaters", name: "Kerala", country: "India" },
          ].map((d) => (
            <div key={d.name} className="group relative overflow-hidden rounded-2xl">
              <img src={d.img} alt={d.name} loading="lazy" className="aspect-[3/4] w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-4 text-primary-foreground">
                <p className="text-xs uppercase tracking-[0.2em] opacity-80">{d.country}</p>
                <h3 className="font-serif text-2xl">{d.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grain relative overflow-hidden rounded-3xl bg-ink p-10 text-primary-foreground md:p-16">
          <h2 className="max-w-3xl font-serif text-4xl font-semibold leading-tight md:text-6xl">
            India is vast. Your travel plan should be smart enough to keep up.
          </h2>
          <Button asChild size="lg" className="mt-8 rounded-full bg-primary-foreground text-ink hover:bg-primary-foreground/90">
            <Link to="/signup">Create your first trip</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t py-10 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Traveloop — Crafted for Indian travellers.
      </footer>
    </div>
  );
}
