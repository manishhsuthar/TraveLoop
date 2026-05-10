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
import { listSavedCitiesApi, type SavedCity } from "@/api/savedCityApi";
import { formatDisplayDate } from "@/lib/date";
import { uploadTripCoverApi } from "@/api/tripApi";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — Traveloop" }] }),
  component: Settings,
});

function Settings() {
  const INDIAN_LANGUAGES = [
    "Hindi", "Gujarati", "Marathi", "Tamil", "Telugu", "Kannada", "Malayalam", "Punjabi", "Bengali", "Assamese",
    "Odia", "Sanskrit", "Urdu", "Konkani", "Manipuri", "Nepali", "Kashmiri", "Sindhi", "Dogri", "Bodo", "Santali", "Maithili",
  ];
  const user = useAuth((s) => s.user);
  const update = useAuth((s) => s.updateProfile);
  const logout = useAuth((s) => s.logout);
  const loadProfile = useAuth((s) => s.loadProfile);
  const navigate = useNavigate();
  const trips = useTrips((s) => s.trips);
  const loadTrips = useTrips((s) => s.loadTrips);
  const [savedCities, setSavedCities] = useState<SavedCity[]>([]);
  const [savedLoading, setSavedLoading] = useState(true);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.profile?.phone ?? "");
  const [city, setCity] = useState(user?.profile?.city ?? "");
  const [country, setCountry] = useState(user?.profile?.country ?? "India");
  const [preferences, setPreferences] = useState(user?.profile?.preferences ?? "");
  const [language, setLanguage] = useState(user?.profile?.language ?? "Hindi");
  const [avatarUrl, setAvatarUrl] = useState(user?.profile?.avatar_url ?? "");
  const [avatarPreview, setAvatarPreview] = useState(user?.profile?.avatar_url ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    loadProfile();
    loadTrips();
  }, [loadProfile, loadTrips]);

  useEffect(() => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setPhone(user?.profile?.phone ?? "");
    setCity(user?.profile?.city ?? "");
    setCountry(user?.profile?.country ?? "India");
    setPreferences(user?.profile?.preferences ?? "");
    setLanguage(user?.profile?.language ?? "Hindi");
    setAvatarUrl(user?.profile?.avatar_url ?? "");
    setAvatarPreview(user?.profile?.avatar_url ?? "");
  }, [user]);

  useEffect(() => {
    setSavedLoading(true);
    listSavedCitiesApi()
      .then(setSavedCities)
      .finally(() => setSavedLoading(false));
  }, []);

  const handleAvatarUpload = async (file: File | undefined) => {
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxBytes = 5 * 1024 * 1024;
    if (!validTypes.includes(file.type)) return toast.error("Only JPG, JPEG, PNG, and WEBP are supported.");
    if (file.size > maxBytes) return toast.error("Profile photo must be under 5MB.");

    setAvatarPreview(URL.createObjectURL(file));
    setUploadingAvatar(true);
    try {
      const uploadedUrl = await uploadTripCoverApi(file);
      setAvatarUrl(uploadedUrl);
      await update({ avatar_url: uploadedUrl });
      await loadProfile();
      toast.success("Profile photo updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Photo upload failed");
      setAvatarPreview(avatarUrl);
    } finally {
      setUploadingAvatar(false);
    }
  };

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
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Profile"
                className="h-full w-full object-cover"
                onError={() => setAvatarPreview("")}
              />
            ) : (
              <AvatarFallback className="text-lg">{(user?.name?.[0] ?? "U").toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
          <div className="space-y-2">
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
              disabled={uploadingAvatar}
            />
            <p className="text-xs text-muted-foreground">
              {uploadingAvatar ? "Uploading photo..." : "Accepted: JPG, JPEG, PNG, WEBP (max 5MB)"}
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <div><Label>City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
          <div><Label>Country</Label><Input value={country} onChange={(e) => setCountry(e.target.value)} /></div>
          <div><Label>Preferences</Label><Input value={preferences} onChange={(e) => setPreferences(e.target.value)} placeholder="Goa, heritage, food walks" /></div>
          <div>
            <Label>Preferred language</Label>
            <select
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {INDIAN_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Button
          className="mt-4"
          disabled={savingProfile}
          onClick={async () => {
            setSavingProfile(true);
            try {
              await update({ name, email, phone, city, country, preferences, language, avatar_url: avatarUrl });
              await loadProfile();
              toast.success("Profile saved");
            } finally {
              setSavingProfile(false);
            }
          }}
        >{savingProfile ? "Saving..." : "Save"}</Button>
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
        <p className="mt-1 text-sm text-muted-foreground">Bookmarked places from discover.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {savedLoading ? (
            <p className="text-sm text-muted-foreground">Loading saved destinations...</p>
          ) : savedCities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved destinations yet. Bookmark cities in Discover.</p>
          ) : (
            savedCities.map((saved) => (
              <article key={saved.id} className="rounded-xl border p-4">
                <p className="font-serif text-xl">{saved.city_name}</p>
                <p className="text-xs text-muted-foreground">{saved.country}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Saved on {formatDisplayDate(saved.created_at.slice(0, 10))}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate({ to: "/discover" })}
                  >
                    Open discover
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${saved.city_name}, ${saved.country}`,
                        )}`,
                        "_blank",
                      )
                    }
                  >
                    Quick view
                  </Button>
                </div>
              </article>
            ))
          )}
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
