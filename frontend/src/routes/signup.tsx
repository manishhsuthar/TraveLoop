import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/store/auth";
import { Compass } from "lucide-react";
import { toast } from "sonner";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — Traveloop" }] }),
  component: Signup,
});

function Signup() {
  const signup = useAuth((s) => s.signup);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || password.length < 6)
      return toast.error("Fill all fields, password 6+ chars.");
    setLoading(true);
    try {
      await signup(name, email, password);
      toast.success("Account created");
      navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create account. Check your backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="flex items-center justify-center bg-background p-8 order-2 md:order-1">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5">
          <div>
            <h1 className="font-serif text-4xl font-semibold">Begin a journey</h1>
            <p className="mt-1 text-sm text-muted-foreground">Create your free account.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary underline-offset-4 hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
      <div className="relative hidden md:block order-1 md:order-2">
        <img src={hero} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-bl from-black/40 to-black/70" />
        <Link to="/" className="absolute right-8 top-8 flex items-center gap-2 text-primary-foreground">
          <span className="font-serif text-xl">Traveloop</span>
          <Compass className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
