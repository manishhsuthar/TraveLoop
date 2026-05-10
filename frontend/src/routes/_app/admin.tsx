import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/store/auth";
import { getAdminAnalytics, patchAdminUser } from "@/api/analyticsApi";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area,
} from "recharts";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Users, Map, Compass, Activity, TrendingUp, Eye, ShieldCheck, Clock,
} from "lucide-react";
import { toast } from "sonner";
import { formatDisplayDate } from "@/lib/date";

export const Route = createFileRoute("/_app/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Traveloop" }] }),
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const u = useAuth.getState().user;
    if (!u || u.role !== "admin") throw redirect({ to: "/dashboard" });
  },
  component: Admin,
});

const COLORS = [
  "oklch(0.62 0.16 38)", "oklch(0.78 0.13 75)", "oklch(0.62 0.06 155)",
  "oklch(0.55 0.12 240)", "oklch(0.45 0.15 320)", "oklch(0.70 0.14 50)",
];

const VIS_COLORS: Record<string, string> = {
  private: "oklch(0.55 0.12 240)", public: "oklch(0.62 0.06 155)", shared: "oklch(0.78 0.13 75)",
};

/* ── tiny helpers ─────────────────────────────────────── */
const fade = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06, duration: 0.4 } });
const cardCls = "rounded-2xl border bg-card p-6 soft-shadow";
const formatMonth = (m: string) => { const [, mo] = m.split("-"); const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; return names[Number(mo) - 1] ?? m; };
const fmtDate = (d: string | null) => (d ? formatDisplayDate(d) : "—");

function Admin() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "users">("overview");

  useEffect(() => {
    getAdminAnalytics()
      .then(setData)
      .catch(() => toast.error("Failed to load admin analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (!data) return <div className="p-10 text-center text-muted-foreground">Unable to load analytics.</div>;

  const kpis = [
    { label: "Total Users", value: data.total_users, icon: Users, accent: "oklch(0.62 0.16 38)" },
    { label: "Total Trips", value: data.total_trips, icon: Map, accent: "oklch(0.78 0.13 75)" },
    { label: "Cities Explored", value: data.total_cities_used, icon: Compass, accent: "oklch(0.62 0.06 155)" },
    { label: "Activities Planned", value: data.total_activities_planned, icon: Activity, accent: "oklch(0.55 0.12 240)" },
  ];

  const userGrowth = (data.user_growth ?? []).map((r: any) => ({ ...r, month: formatMonth(r.month) }));
  const tripTrends = (data.trip_trends ?? []).map((r: any) => ({ ...r, month: formatMonth(r.month) }));
  const topCities = (data.top_cities ?? []).map((c: any) => ({ name: c.city__name, country: c.city__country, visits: c.visits }));
  const actDist = (data.activity_distribution ?? []).map((a: any) => ({ name: a.activity__activity_type, value: a.count }));
  const visDist = (data.visibility_breakdown ?? []).map((v: any) => ({ name: v.visibility, value: v.count }));

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 px-4 py-8 md:px-8">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Operations</span>
          <h1 className="mt-1 font-serif text-4xl font-semibold">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Platform-wide analytics &amp; user management</p>
        </div>
        <div className="flex gap-1 rounded-xl border bg-muted/50 p-1">
          {(["overview", "users"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-all ${tab === t ? "bg-card text-foreground soft-shadow" : "text-muted-foreground hover:text-foreground"}`}>
              {t === "overview" ? "Analytics" : "User Management"}
            </button>
          ))}
        </div>
      </header>

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} {...fade(i)} className={`${cardCls} relative overflow-hidden`}>
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-[0.07]" style={{ background: k.accent }} />
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `color-mix(in oklab, ${k.accent} 12%, transparent)` }}>
                <k.icon className="h-5 w-5" style={{ color: k.accent }} />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{k.label}</div>
                <div className="font-serif text-3xl font-semibold">{k.value.toLocaleString()}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {tab === "overview" ? <OverviewTab userGrowth={userGrowth} tripTrends={tripTrends} topCities={topCities} actDist={actDist} visDist={visDist} engagement={data.user_engagement ?? []} recentTrips={data.recent_trips ?? []} /> : <UsersTab users={data.all_users ?? []} onRefresh={() => getAdminAnalytics().then(setData)} />}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   OVERVIEW TAB
   ══════════════════════════════════════════════════════════ */
function OverviewTab({ userGrowth, tripTrends, topCities, actDist, visDist, engagement, recentTrips }: any) {
  return (
    <div className="space-y-8">
      {/* Growth Charts */}
      <section className="grid gap-6 lg:grid-cols-2">
        <motion.div {...fade(0)} className={cardCls}>
          <div className="mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /><h3 className="font-serif text-xl">User Growth</h3></div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={userGrowth}>
                <defs><linearGradient id="ug" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="oklch(0.62 0.16 38)" stopOpacity={0.3} /><stop offset="95%" stopColor="oklch(0.62 0.16 38)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.02 75)" />
                <XAxis dataKey="month" stroke="oklch(0.45 0.02 60)" fontSize={12} />
                <YAxis stroke="oklch(0.45 0.02 60)" fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="oklch(0.62 0.16 38)" fill="url(#ug)" strokeWidth={2} name="Users" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        <motion.div {...fade(1)} className={cardCls}>
          <div className="mb-4 flex items-center gap-2"><Map className="h-4 w-4 text-primary" /><h3 className="font-serif text-xl">Trip Trends</h3></div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={tripTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.02 75)" />
                <XAxis dataKey="month" stroke="oklch(0.45 0.02 60)" fontSize={12} />
                <YAxis stroke="oklch(0.45 0.02 60)" fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="oklch(0.78 0.13 75)" radius={[6, 6, 0, 0]} name="Trips" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </section>

      {/* Analytical Cards */}
      <section className="grid gap-6 lg:grid-cols-3">
        <motion.div {...fade(2)} className={cardCls}>
          <h3 className="mb-4 font-serif text-xl">Top Cities</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={topCities} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.02 75)" />
                <XAxis type="number" stroke="oklch(0.45 0.02 60)" fontSize={12} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="oklch(0.45 0.02 60)" fontSize={11} width={80} />
                <Tooltip />
                <Bar dataKey="visits" fill="oklch(0.62 0.16 38)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        <motion.div {...fade(3)} className={cardCls}>
          <h3 className="mb-4 font-serif text-xl">Activity Types</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={actDist} dataKey="value" outerRadius={85} innerRadius={45} paddingAngle={3} label={({ name }) => name}>
                  {actDist.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        <motion.div {...fade(4)} className={cardCls}>
          <div className="mb-4 flex items-center gap-2"><Eye className="h-4 w-4 text-primary" /><h3 className="font-serif text-xl">Trip Visibility</h3></div>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={visDist} dataKey="value" outerRadius={85} innerRadius={45} paddingAngle={3} label={({ name, value }) => `${name} (${value})`}>
                  {visDist.map((v: any) => <Cell key={v.name} fill={VIS_COLORS[v.name] ?? COLORS[0]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </section>

      {/* Tables row */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Top Engaged Users */}
        <motion.div {...fade(5)} className={cardCls}>
          <div className="mb-4 flex items-center gap-2"><Users className="h-4 w-4 text-primary" /><h3 className="font-serif text-xl">Top Engaged Users</h3></div>
          <div className="overflow-auto rounded-xl border">
            <Table>
              <TableHeader><TableRow><TableHead>#</TableHead><TableHead>User</TableHead><TableHead>Email</TableHead><TableHead className="text-right">Trips</TableHead></TableRow></TableHeader>
              <TableBody>
                {engagement.map((u: any, i: number) => (
                  <TableRow key={u.id}><TableCell className="font-medium">{i + 1}</TableCell><TableCell>{u.username}</TableCell><TableCell className="text-muted-foreground text-sm">{u.email}</TableCell><TableCell className="text-right font-semibold">{u.trip_count}</TableCell></TableRow>
                ))}
                {engagement.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">No data</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </motion.div>
        {/* Recent Trips */}
        <motion.div {...fade(6)} className={cardCls}>
          <div className="mb-4 flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /><h3 className="font-serif text-xl">Recent Trips</h3></div>
          <div className="overflow-auto rounded-xl border">
            <Table>
              <TableHeader><TableRow><TableHead>Trip</TableHead><TableHead>User</TableHead><TableHead>Dates</TableHead><TableHead>Visibility</TableHead></TableRow></TableHeader>
              <TableBody>
                {recentTrips.map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium max-w-[140px] truncate">{t.name}</TableCell>
                    <TableCell className="text-sm">{t.user__username}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{fmtDate(t.start_date)} – {fmtDate(t.end_date)}</TableCell>
                    <TableCell><VisBadge v={t.visibility} /></TableCell>
                  </TableRow>
                ))}
                {recentTrips.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">No data</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   USERS TAB
   ══════════════════════════════════════════════════════════ */
function UsersTab({ users, onRefresh }: { users: any[]; onRefresh: () => void }) {
  const [search, setSearch] = useState("");
  const filtered = users.filter((u: any) =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleToggle = async (userId: number, field: "is_active" | "is_staff", value: boolean) => {
    try {
      await patchAdminUser(userId, { [field]: value });
      toast.success("User updated");
      onRefresh();
    } catch { toast.error("Update failed"); }
  };

  return (
    <motion.div {...fade(0)} className={cardCls}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /><h3 className="font-serif text-xl">User Management</h3><Badge variant="secondary">{users.length} users</Badge></div>
        <input type="text" placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border bg-background px-3 py-1.5 text-sm outline-none ring-ring focus:ring-2 w-full sm:w-64" />
      </div>
      <div className="overflow-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead><TableHead>Email</TableHead><TableHead>Joined</TableHead>
              <TableHead>Last Login</TableHead><TableHead className="text-center">Trips</TableHead>
              <TableHead className="text-center">Active</TableHead><TableHead className="text-center">Staff</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u: any) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.username}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                <TableCell className="text-sm whitespace-nowrap">{fmtDate(u.date_joined)}</TableCell>
                <TableCell className="text-sm whitespace-nowrap text-muted-foreground">{fmtDate(u.last_login)}</TableCell>
                <TableCell className="text-center font-semibold">{u.trip_count}</TableCell>
                <TableCell className="text-center"><Switch checked={u.is_active} onCheckedChange={(v) => handleToggle(u.id, "is_active", v)} /></TableCell>
                <TableCell className="text-center"><Switch checked={u.is_staff} onCheckedChange={(v) => handleToggle(u.id, "is_staff", v)} /></TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No users match your search.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}

/* ── Small components ─────────────────────────────────── */
function VisBadge({ v }: { v: string }) {
  const map: Record<string, string> = { private: "destructive", public: "default", shared: "secondary" };
  return <Badge variant={map[v] as any ?? "outline"} className="capitalize text-[10px]">{v}</Badge>;
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-8 px-4 py-8 md:px-8">
      <div className="h-8 w-56 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => <div key={i} className="h-72 animate-pulse rounded-2xl bg-muted" />)}
      </div>
    </div>
  );
}
