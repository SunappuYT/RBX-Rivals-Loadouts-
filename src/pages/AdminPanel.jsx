import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, Trash2, Ban, Search, Loader2, CheckCircle, RotateCcw, Flag, AlertTriangle, Award, Plus, X } from "lucide-react";

const SPECIAL_TITLES = ["Meta Pick", "Staff Approved", "Top Tier", "Community Fav", "Pro Build", "Hidden Gem"];

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [loadouts, setLoadouts] = useState([]);
  const [reports, setReports] = useState([]);
  const [badges, setBadges] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("loadouts");
  const [titleInput, setTitleInput] = useState({});
  const [saving, setSaving] = useState({});
  const [newBadge, setNewBadge] = useState({ user_email: "", badge_name: "", badge_emoji: "" });
  const [addingBadge, setAddingBadge] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (!authed) { base44.auth.redirectToLogin(); return; }
      const me = await base44.auth.me();
      if (me.role !== "admin") {
        window.location.href = "/";
        return;
      }
      setUser(me);
      const all = await base44.entities.Loadout.list("-created_date", 200);
      setLoadouts(all);
      const allReports = await base44.entities.Report.list("-created_date", 200);
      setReports(allReports);
      const allBadges = await base44.entities.UserBadge.list("-created_date", 500);
      setBadges(allBadges);
      setLoading(false);
    });
  }, []);

  const setSaving_ = (id, val) => setSaving((prev) => ({ ...prev, [id]: val }));

  const toggleBan = async (loadout) => {
    setSaving_(loadout.id, "ban");
    const updated = await base44.entities.Loadout.update(loadout.id, { is_banned: !loadout.is_banned });
    setLoadouts((prev) => prev.map((l) => l.id === loadout.id ? { ...l, is_banned: !loadout.is_banned } : l));
    setSaving_(loadout.id, null);
  };

  const deleteLoadout = async (loadout) => {
    if (!confirm(`Delete "${loadout.title}"? This cannot be undone.`)) return;
    setSaving_(loadout.id, "delete");
    await base44.entities.Loadout.delete(loadout.id);
    setLoadouts((prev) => prev.filter((l) => l.id !== loadout.id));
    setSaving_(loadout.id, null);
  };

  const applySpecialTitle = async (loadout, title) => {
    setSaving_(loadout.id, "title");
    await base44.entities.Loadout.update(loadout.id, { special_title: title });
    setLoadouts((prev) => prev.map((l) => l.id === loadout.id ? { ...l, special_title: title } : l));
    setSaving_(loadout.id, null);
  };

  const clearTitle = async (loadout) => {
    setSaving_(loadout.id, "title");
    await base44.entities.Loadout.update(loadout.id, { special_title: "" });
    setLoadouts((prev) => prev.map((l) => l.id === loadout.id ? { ...l, special_title: "" } : l));
    setSaving_(loadout.id, null);
  };

  const resolveReport = async (report) => {
    await base44.entities.Report.update(report.id, { resolved: true });
    setReports((prev) => prev.map((r) => r.id === report.id ? { ...r, resolved: true } : r));
  };

  const deleteReport = async (report) => {
    await base44.entities.Report.delete(report.id);
    setReports((prev) => prev.filter((r) => r.id !== report.id));
  };

  const awardBadge = async () => {
    if (!newBadge.user_email || !newBadge.badge_name) return;
    setAddingBadge(true);
    const created = await base44.entities.UserBadge.create({ ...newBadge, awarded_by: user.email });
    setBadges((prev) => [created, ...prev]);
    setNewBadge({ user_email: "", badge_name: "", badge_emoji: "" });
    setAddingBadge(false);
  };

  const deleteBadge = async (badge) => {
    await base44.entities.UserBadge.delete(badge.id);
    setBadges((prev) => prev.filter((b) => b.id !== badge.id));
  };

  const filtered = loadouts.filter((l) => {
    const q = search.toLowerCase();
    return !q || l.title?.toLowerCase().includes(q) || l.author_name?.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-28 pb-20">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary/20 border border-primary/40 rounded flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-rajdhani text-3xl font-700 text-foreground uppercase tracking-wider">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">Manage community loadouts</p>
          </div>
          <div className="ml-auto flex gap-3 text-xs text-muted-foreground">
            <span className="bg-secondary border border-border px-2 py-1 rounded">{loadouts.length} total</span>
            <span className="bg-destructive/20 border border-destructive/30 text-destructive px-2 py-1 rounded">
              {loadouts.filter((l) => l.is_banned).length} banned
            </span>
            {reports.filter((r) => !r.resolved).length > 0 && (
              <span className="bg-amber-500/20 border border-amber-500/30 text-amber-400 px-2 py-1 rounded flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {reports.filter((r) => !r.resolved).length} pending reports
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab("loadouts")}
            className={`pb-2 px-1 text-sm font-rajdhani uppercase tracking-wider transition-colors ${activeTab === "loadouts" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            Loadouts
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`pb-2 px-1 text-sm font-rajdhani uppercase tracking-wider transition-colors flex items-center gap-1.5 ${activeTab === "reports" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Flag className="w-3.5 h-3.5" /> Reports
            {reports.filter((r) => !r.resolved).length > 0 && (
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs px-1.5 py-0.5 rounded-full">
                {reports.filter((r) => !r.resolved).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("badges")}
            className={`pb-2 px-1 text-sm font-rajdhani uppercase tracking-wider transition-colors flex items-center gap-1.5 ${activeTab === "badges" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Award className="w-3.5 h-3.5" /> Badges
          </button>
        </div>

        {/* Search (loadouts only) */}
        {activeTab === "loadouts" && <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>}

        {activeTab === "reports" && (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {reports.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">No reports submitted yet.</div>
            ) : (
              <div className="divide-y divide-border">
                {reports.map((report) => (
                  <div key={report.id} className={`px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3 ${report.resolved ? "opacity-50" : ""}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-rajdhani font-700 text-foreground">{report.loadout_title || report.loadout_id}</span>
                        {report.resolved ? (
                          <span className="text-xs bg-green-500/10 border border-green-500/30 text-green-400 px-2 py-0.5 rounded">Resolved</span>
                        ) : (
                          <span className="text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded">Pending</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Reported by: {report.reporter_email}</p>
                      {report.reason && <p className="text-xs text-muted-foreground mt-1 italic">"{report.reason}"</p>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {!report.resolved && (
                        <Button size="sm" variant="outline" onClick={() => resolveReport(report)} className="text-xs gap-1.5 border-green-500/40 text-green-400 hover:bg-green-500/10">
                          <CheckCircle className="w-3 h-3" /> Resolve
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => deleteReport(report)} className="text-xs gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-3 h-3" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "badges" && (
          <div className="space-y-6">
            {/* Award badge form */}
            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="font-rajdhani text-base uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" /> Award a Badge
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="User email..."
                  value={newBadge.user_email}
                  onChange={(e) => setNewBadge((b) => ({ ...b, user_email: e.target.value }))}
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
                <Input
                  placeholder="Badge name..."
                  value={newBadge.badge_name}
                  onChange={(e) => setNewBadge((b) => ({ ...b, badge_name: e.target.value }))}
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
                <Input
                  placeholder="Emoji (e.g. 🏅)..."
                  value={newBadge.badge_emoji}
                  onChange={(e) => setNewBadge((b) => ({ ...b, badge_emoji: e.target.value }))}
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground w-32"
                />
                <Button onClick={awardBadge} disabled={addingBadge || !newBadge.user_email || !newBadge.badge_name} className="bg-primary text-primary-foreground gap-1.5 shrink-0">
                  {addingBadge ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} Award
                </Button>
              </div>
            </div>

            {/* Badges list */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              {badges.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">No badges awarded yet.</div>
              ) : (
                <div className="divide-y divide-border">
                  {badges.map((badge) => (
                    <div key={badge.id} className="px-4 py-3 flex items-center gap-3">
                      <span className="text-xl">{badge.badge_emoji || "🏅"}</span>
                      <div className="flex-1 min-w-0">
                        <span className="font-rajdhani font-700 text-foreground tracking-wide">{badge.badge_name}</span>
                        <p className="text-xs text-muted-foreground">→ {badge.user_email}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => deleteBadge(badge)} className="text-xs gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10">
                        <X className="w-3 h-3" /> Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "loadouts" && (
        <>
        {/* Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_120px_200px_auto] gap-0">
            {/* Header */}
            <div className="col-span-full grid grid-cols-[1fr_120px_200px_auto] bg-secondary px-4 py-3 border-b border-border hidden md:grid">
              <span className="text-xs font-rajdhani uppercase tracking-widest text-muted-foreground">Loadout</span>
              <span className="text-xs font-rajdhani uppercase tracking-widest text-muted-foreground">Status</span>
              <span className="text-xs font-rajdhani uppercase tracking-widest text-muted-foreground">Special Title</span>
              <span className="text-xs font-rajdhani uppercase tracking-widest text-muted-foreground">Actions</span>
            </div>

            {filtered.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground text-sm">No loadouts found.</div>
            )}

            {filtered.map((loadout) => (
              <div key={loadout.id} className={`col-span-full border-b border-border last:border-0 px-4 py-4 flex flex-col md:grid md:grid-cols-[1fr_120px_200px_auto] gap-3 md:gap-0 md:items-center ${loadout.is_banned ? "opacity-50 bg-destructive/5" : ""}`}>
                {/* Info */}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-rajdhani font-700 text-foreground tracking-wide">{loadout.title}</span>
                    {loadout.special_title && (
                      <span className="text-xs bg-primary/20 border border-primary/40 text-primary px-2 py-0.5 rounded font-medium">
                        {loadout.special_title}
                      </span>
                    )}
                    {loadout.is_banned && (
                      <span className="text-xs bg-destructive/20 border border-destructive/40 text-destructive px-2 py-0.5 rounded">BANNED</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    by {loadout.author_name || loadout.created_by || "Anonymous"} • {loadout.primary_weapon}
                    {loadout.secondary_weapon && ` + ${loadout.secondary_weapon}`} • {loadout.upvotes || 0} votes
                  </p>
                </div>

                {/* Status */}
                <div className="md:pl-2">
                  <span className={`text-xs px-2 py-0.5 rounded border ${loadout.is_banned ? "bg-destructive/20 border-destructive/40 text-destructive" : "bg-green-500/10 border-green-500/30 text-green-400"}`}>
                    {loadout.is_banned ? "Banned" : "Active"}
                  </span>
                </div>

                {/* Special Title */}
                <div className="flex flex-wrap gap-1.5 md:pl-2">
                  {SPECIAL_TITLES.map((t) => (
                    <button
                      key={t}
                      onClick={() => loadout.special_title === t ? clearTitle(loadout) : applySpecialTitle(loadout, t)}
                      disabled={saving[loadout.id] === "title"}
                      className={`text-xs px-2 py-0.5 rounded border transition-all ${
                        loadout.special_title === t
                          ? "bg-primary/30 border-primary text-primary"
                          : "bg-secondary border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 md:justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleBan(loadout)}
                    disabled={!!saving[loadout.id]}
                    className={`text-xs gap-1.5 ${loadout.is_banned ? "border-green-500/40 text-green-400 hover:bg-green-500/10" : "border-amber-500/40 text-amber-400 hover:bg-amber-500/10"}`}
                  >
                    {saving[loadout.id] === "ban" ? <Loader2 className="w-3 h-3 animate-spin" /> : loadout.is_banned ? <RotateCcw className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                    {loadout.is_banned ? "Unban" : "Ban"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteLoadout(loadout)}
                    disabled={!!saving[loadout.id]}
                    className="text-xs gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10"
                  >
                    {saving[loadout.id] === "delete" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
