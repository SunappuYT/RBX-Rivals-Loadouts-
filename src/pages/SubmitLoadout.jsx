import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Swords, CheckCircle, Plus, X } from "lucide-react";

const PRIMARY_WEAPONS = [
  "Distortion", "Permafrost", "Energy Rifle", "Flamethrower", "Grenade Launcher",
  "Minigun", "Paintball Gun", "Assault Rifle", "Bow", "Burst Rifle",
  "Crossbow", "Gunblade", "RPG", "Shotgun", "Sniper"
];

const SECONDARY_WEAPONS = [
  "Warper", "Energy Pistols", "Exogun", "Slingshot", "Daggers",
  "Flare Gun", "Handgun", "Revolver", "Shorty", "Spray", "Uzi"
];

const MELEE_OPTIONS = [
  "Maul", "Spear", "Trowel", "Battle Axe", "Chainsaw",
  "Fists", "Katana", "Knife", "Riot Shield", "Scythe"
];

const UTILITY_OPTIONS = [
  "Grappler", "Medkit", "Subspace Tripmine", "Warpstone", "Flashbang",
  "Freeze Ray", "Grenade", "Jump Pad", "Molotov", "Satchel",
  "Smoke Grenade", "War Horn"
];

function WeaponSelect({ label, value, onChange, options, placeholder, required }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
        {label} {required && <span className="text-primary">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange} required={required}>
        <SelectTrigger className="bg-secondary border-border text-foreground">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-card border-border max-h-60">
          {options.map((o) => (
            <SelectItem key={o} value={o}>{o}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function SubmitLoadout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [form, setForm] = useState({
    title: "",
    author_name: "",
    primary_weapon: "",
    secondary_weapon: "",
    melee: "",
    utility: "",
    sensitivity: "",
    playstyle: "",
    rank_tier: "",
    notes: "",
    tags: [],
  });

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (!authed) { base44.auth.redirectToLogin(); return; }
      const me = await base44.auth.me();
      setForm((prev) => ({ ...prev, author_name: me.full_name || "" }));
    });
  }, []);

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (t && !form.tags.includes(t)) set("tags", [...form.tags, t]);
    setTagInput("");
  };

  const removeTag = (tag) => set("tags", form.tags.filter((t) => t !== tag));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.primary_weapon) return;
    setLoading(true);
    const payload = {
      ...form,
      sensitivity: form.sensitivity ? parseFloat(form.sensitivity) : undefined,
      upvotes: 0,
      is_banned: false,
    };
    await base44.entities.Loadout.create(payload);
    setSuccess(true);
    setLoading(false);
    setTimeout(() => navigate("/"), 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="font-rajdhani text-3xl text-foreground uppercase tracking-wider mb-2">Loadout Submitted!</h2>
          <p className="text-muted-foreground">Redirecting to browse...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-28 pb-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary/20 border border-primary/40 rounded flex items-center justify-center">
            <Swords className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-rajdhani text-3xl font-700 text-foreground uppercase tracking-wider">Submit Loadout</h1>
            <p className="text-xs text-muted-foreground">Share your competitive build with the community</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-5">
            <h2 className="font-rajdhani text-sm text-primary uppercase tracking-widest border-b border-border pb-2">Basic Info</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Loadout Title <span className="text-primary">*</span></Label>
                <Input
                  required
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. Pro Aggressive Rush Build"
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Your Name</Label>
                <Input
                  value={form.author_name}
                  onChange={(e) => set("author_name", e.target.value)}
                  placeholder="Display name"
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Recommended Rank</Label>
                <Select value={form.rank_tier} onValueChange={(v) => set("rank_tier", v)}>
                  <SelectTrigger className="bg-secondary border-border text-foreground">
                    <SelectValue placeholder="Recommended Rank" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Onyx", "Nemesis", "Archnemesis"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Loadout Slots */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-5">
            <h2 className="font-rajdhani text-sm text-primary uppercase tracking-widest border-b border-border pb-2">Loadout Slots</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <WeaponSelect label="Primary Weapon" value={form.primary_weapon} onChange={(v) => set("primary_weapon", v)} options={PRIMARY_WEAPONS} placeholder="Select primary" required />
              <WeaponSelect label="Secondary Weapon" value={form.secondary_weapon} onChange={(v) => set("secondary_weapon", v)} options={SECONDARY_WEAPONS} placeholder="Select secondary" />
              <WeaponSelect label="Melee" value={form.melee} onChange={(v) => set("melee", v)} options={MELEE_OPTIONS} placeholder="Select melee" />
              <WeaponSelect label="Utility" value={form.utility} onChange={(v) => set("utility", v)} options={UTILITY_OPTIONS} placeholder="Select utility" />
            </div>
          </div>

          {/* Settings */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-5">
            <h2 className="font-rajdhani text-sm text-primary uppercase tracking-widest border-b border-border pb-2">Settings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Sensitivity</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.sensitivity}
                  onChange={(e) => set("sensitivity", e.target.value)}
                  placeholder="e.g. 0.75"
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Playstyle</Label>
                <Select value={form.playstyle} onValueChange={(v) => set("playstyle", v)}>
                  <SelectTrigger className="bg-secondary border-border text-foreground">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {["Aggressive", "Defensive", "Balanced", "Support", "Sniper"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Notes & Tags */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-5">
            <h2 className="font-rajdhani text-sm text-primary uppercase tracking-widest border-b border-border pb-2">Strategy & Notes</h2>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Playstyle Notes</Label>
              <Textarea
                rows={4}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Share tips, strategy, when to use this loadout..."
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="e.g. meta, beginner-friendly..."
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
                <Button type="button" variant="outline" size="sm" onClick={addTag} className="border-border hover:border-primary/40 px-3">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {form.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 bg-muted text-muted-foreground text-xs rounded px-2 py-1">
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-foreground">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-primary font-rajdhani tracking-widest uppercase py-6 text-base"
          >
            {loading ? "Submitting..." : "Submit Loadout"}
          </Button>
        </form>
      </div>
    </div>
  );
}
