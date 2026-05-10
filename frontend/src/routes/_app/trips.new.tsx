import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTrips } from "@/store/trips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { uploadTripCoverApi } from "@/api/tripApi";
import { formatDisplayDate } from "@/lib/date";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/trips/new")({
  head: () => ({ meta: [{ title: "New trip — Traveloop" }] }),
  component: NewTrip,
});

const FALLBACK_COVER = "https://source.unsplash.com/1200x800/?india,travel";

function NewTrip() {
  const navigate = useNavigate();
  const create = useTrips((s) => s.createTrip);
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStart] = useState("");
  const [endDate, setEnd] = useState("");
  const [budget, setBudget] = useState("25000");
  const [preferences, setPreferences] = useState("");
  const [privacy, setPrivacy] = useState<"private" | "public">("private");
  const [cover, setCover] = useState(FALLBACK_COVER);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState(FALLBACK_COVER);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [creating, setCreating] = useState(false);

  const destinationPreview = useMemo(
    () => `https://source.unsplash.com/1200x800/?${encodeURIComponent(destination || "india travel")}`,
    [destination],
  );

  const validateStepOne = () => {
    if (!title.trim() || !destination.trim()) {
      toast.error("Trip name and destination are required.");
      return false;
    }
    return true;
  };

  const validateStepTwo = () => {
    if (!startDate || !endDate) {
      toast.error("Start and end dates are required.");
      return false;
    }
    if (endDate < startDate) {
      toast.error("End date cannot be before start date.");
      return false;
    }
    if ((Number(budget) || 0) < 0) {
      toast.error("Budget cannot be negative.");
      return false;
    }
    return true;
  };

  const onCoverSelect = (file: File | undefined) => {
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxBytes = 5 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, or WEBP images are allowed.");
      return;
    }
    if (file.size > maxBytes) {
      toast.error("Cover image must be under 5MB.");
      return;
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStepOne() || !validateStepTwo()) return;
    try {
      setCreating(true);
      let coverUrl = cover || FALLBACK_COVER;
      if (coverFile) {
        setUploadingCover(true);
        try {
          coverUrl = await uploadTripCoverApi(coverFile);
        } catch {
          toast.error("Cover upload failed. Using fallback image.");
          coverUrl = destinationPreview || FALLBACK_COVER;
        } finally {
          setUploadingCover(false);
        }
      }

      const id = await create({
        title,
        description,
        startDate,
        endDate,
        cover: coverUrl,
        privacy,
        budget: Number(budget) || 0,
        destination,
        preferences,
      });
      toast.success("Trip created");
      navigate({ to: "/trips/$tripId", params: { tripId: id } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create trip");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 md:px-8">
      <header>
        <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Compose</span>
        <h1 className="mt-2 font-serif text-4xl font-semibold">A new journey</h1>
      </header>
      <form onSubmit={submit} className="space-y-6 rounded-2xl border bg-card p-6 soft-shadow">
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                if (s === 2 && !validateStepOne()) return;
                if (s === 3 && (!validateStepOne() || !validateStepTwo())) return;
                setStep(s);
              }}
              className={`rounded-md px-2 py-2 text-sm transition ${step === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              Step {s}
            </button>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Trip name</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Goa Beach Workation" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What are you dreaming about?" />
            </div>
            <div className="space-y-2">
              <Label>Destination</Label>
              <Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Goa" />
            </div>
            <div className="space-y-2">
              <Label>Visibility</Label>
              <RadioGroup value={privacy} onValueChange={(v) => setPrivacy(v as "private" | "public")} className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="private" /> Private
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="public" /> Public (shareable link)
                </label>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label>Cover image upload</Label>
              <Input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => onCoverSelect(e.target.files?.[0])} />
              <img
                src={coverPreview || destinationPreview || FALLBACK_COVER}
                alt="Trip cover preview"
                onError={() => setCoverPreview(FALLBACK_COVER)}
                className="aspect-[4/3] w-full rounded-xl border object-cover"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Start date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStart(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End date</Label>
                <Input type="date" min={startDate || undefined} value={endDate} onChange={(e) => setEnd(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Budget (INR)</Label>
              <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Interests / preferences</Label>
              <Textarea value={preferences} onChange={(e) => setPreferences(e.target.value)} rows={3} placeholder="Food, beaches, nightlife, local culture..." />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-xl border p-4">
              <h3 className="font-medium">{title || "Untitled trip"}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{description || "No description provided."}</p>
              <p className="mt-2 text-sm">Destination: <span className="text-muted-foreground">{destination || "Not set"}</span></p>
              <p className="text-sm">Dates: <span className="text-muted-foreground">{startDate ? formatDisplayDate(startDate) : "Not set"} - {endDate ? formatDisplayDate(endDate) : "Not set"}</span></p>
              <p className="text-sm">Budget: <span className="text-muted-foreground">INR {(Number(budget) || 0).toLocaleString("en-IN")}</span></p>
              <p className="text-sm">Preferences: <span className="text-muted-foreground">{preferences || "Not provided"}</span></p>
            </div>
            <div className="rounded-xl border p-3">
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">Destination preview</p>
              <img
                src={coverPreview || destinationPreview}
                alt="Destination preview"
                onError={() => setCoverPreview(FALLBACK_COVER)}
                className="aspect-[4/3] w-full rounded-lg object-cover"
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-between gap-2">
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => navigate({ to: "/trips" })}>Cancel</Button>
            {step > 1 && <Button type="button" variant="outline" onClick={() => setStep((v) => v - 1)}>Back</Button>}
          </div>
          <div className="flex gap-2">
            {step < 3 ? (
              <Button
                type="button"
                onClick={() => {
                  if (step === 1 && !validateStepOne()) return;
                  if (step === 2 && !validateStepTwo()) return;
                  setStep((v) => v + 1);
                }}
              >
                Continue
              </Button>
            ) : (
              <Button type="submit" disabled={creating || uploadingCover}>
                {creating || uploadingCover ? "Creating..." : "Create trip"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
