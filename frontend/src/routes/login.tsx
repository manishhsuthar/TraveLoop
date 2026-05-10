import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/store/auth";
import { Compass } from "lucide-react";
import { toast } from "sonner";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Traveloop" }] }),
  component: Login,
});

function Login() {
  const login = useAuth((s) => s.login);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill in both fields.");
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not sign in. Check your backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden md:block">
        <img src={hero} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/70" />
        <Link to="/" className="absolute left-8 top-8 flex items-center gap-2 text-primary-foreground">
          <Compass className="h-5 w-5" />
          <span className="font-serif text-xl">Traveloop</span>
        </Link>
        <div className="absolute bottom-10 left-8 right-8 text-primary-foreground">
          <h2 className="font-serif text-4xl leading-tight">"The journey itself is my home."</h2>
          <p className="mt-2 text-sm opacity-80">— Bashō</p>
        </div>
      </div>
      <div className="flex items-center justify-center bg-background p-8">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5">
          <div>
            <h1 className="font-serif text-4xl font-semibold">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to keep planning.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email or username</Label>
            <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="demo or you@example.com" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-primary">Forgot?</Link>
            </div>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/signup" className="text-primary underline-offset-4 hover:underline">Create an account</Link>
          </p>
          <p className="text-center text-xs text-muted-foreground">Demo: use username demo and password demo12345 after running seed_demo.</p>
        </form>
      </div>
    </div>
  );
}
