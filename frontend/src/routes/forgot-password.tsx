import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — Traveloop" }] }),
  component: Forgot,
});

function Forgot() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div className="grid min-h-screen place-items-center bg-background p-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!email) return toast.error("Enter your email.");
          setSent(true);
          toast.success("If an account exists, we just sent a reset link.");
        }}
        className="w-full max-w-sm space-y-5"
      >
        <div>
          <h1 className="font-serif text-4xl font-semibold">Reset password</h1>
          <p className="mt-1 text-sm text-muted-foreground">We'll email you a reset link.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={sent}>
          {sent ? "Link sent" : "Send reset link"}
        </Button>
        <p className="text-center text-sm">
          <Link to="/login" className="text-muted-foreground underline-offset-4 hover:underline">Back to sign in</Link>
        </p>
      </form>
    </div>
  );
}
