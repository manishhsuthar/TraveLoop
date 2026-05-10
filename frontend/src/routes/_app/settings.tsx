import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/store/auth";
import { useTrips } from "@/store/trips";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — Traveloop" }] }),
  component: Settings,
});

function Settings() {
  const user = useAuth((s) => s.user);
  const update = useAuth((s) => s.updateProfile);
  const logout = useAuth((s) => s.logout);
  const loadProfile = useAuth((s) => s.loadProfile);
  const navigate = useNavigate();
  const trips = useTrips((s) => s.trips);
  const loadTrips = useTrips((s) => s.loadTrips);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.profile?.phone ?? "");
  const [city, setCity] = useState(user?.profile?.city ?? "");
  const [country, setCountry] = useState(user?.profile?.country ?? "India");
  const [preferences, setPreferences] = useState(user?.profile?.preferences ?? "");

  useEffect(() => {
    loadProfile();
    loadTrips();
  }, [loadProfile, loadTrips]);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 md:px-8">
      <header>
        <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Account</span>
        <h1 className="mt-2 font-serif text-4xl font-semibold">Settings</h1>
      </header>

      <section className="rounded-2xl border bg-card p-6 soft-shadow">
        <h3 className="font-serif text-2xl">Profile</h3>
        <div className="mt-4 flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg">{(user?.name?.[0] ?? "U").toUpperCase()}</AvatarFallback>
          </Avatar>
          <Button variant="outline">Upload photo</Button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <div><Label>City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
          <div><Label>Country</Label><Input value={country} onChange={(e) => setCountry(e.target.value)} /></div>
          <div><Label>Preferences</Label><Input value={preferences} onChange={(e) => setPreferences(e.target.value)} placeholder="Goa, heritage, food walks" /></div>
        </div>
        <Button
          className="mt-4"
          onClick={() => {
            update({ name, email, phone, city, country, preferences });
            toast.success("Profile saved");
          }}
        >Save</Button>
      </section>

      <section className="rounded-2xl border bg-card p-6 soft-shadow">
        <h3 className="font-serif text-2xl">Preferences</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <Label>Currency</Label>
            <Input value="INR (₹)" readOnly />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-6 soft-shadow">
        <h3 className="font-serif text-2xl">Saved destinations</h3>
        <p className="mt-1 text-sm text-muted-foreground">Cities you've planned trips to.</p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          {[...new Set(trips.flatMap((t) => t.stops.map((s) => s.cityName)))].map((c) => (
            <span key={c} className="rounded-full border px-3 py-1">{c}</span>
          ))}
        </div>
      </section>

      <Separator />

      <section className="rounded-2xl border border-destructive/40 bg-card p-6 soft-shadow">
        <h3 className="font-serif text-2xl text-destructive">Danger zone</h3>
        <p className="mt-1 text-sm text-muted-foreground">Permanently delete your account and all trip data.</p>
        <Button
          variant="destructive"
          className="mt-3"
          onClick={() => {
            if (confirm("Delete account? This cannot be undone.")) {
              logout();
              navigate({ to: "/" });
            }
          }}
        >
          Delete account
        </Button>
      </section>
    </div>
  );
}
