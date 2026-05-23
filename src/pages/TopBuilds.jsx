import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import Navbar from "@/components/layout/Navbar";
import LoadoutCard from "@/components/loadouts/LoadoutCard";
import { Trophy, Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PRIMARY_WEAPONS = ["Distortion","Permafrost","Energy Rifle","Flamethrower","Grenade Launcher","Minigun","Paintball Gun","Assault Rifle","Bow","Burst Rifle","Crossbow","Gunblade","RPG","Shotgun","Sniper"];
const SECONDARY_WEAPONS = ["Warper","Energy Pistols","Exogun","Slingshot","Daggers","Flare Gun","Handgun","Revolver","Shorty","Spray","Uzi"];
const MELEE_OPTIONS = ["Maul","Spear","Trowel","Battle Axe","Chainsaw","Fists","Katana","Knife","Riot Shield","Scythe"];
const UTILITY_OPTIONS = ["Grappler","Medkit","Subspace Tripmine","Warpstone","Flashbang","Freeze Ray","Grenade","Jump Pad","Molotov","Satchel","Smoke Grenade","War Horn"];

const MEDAL = ["🥇", "🥈", "🥉"];

export default function TopBuilds() {
  const [loadouts, setLoadouts] = useState([]);
  const [votes, setVotes] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPrimary, setFilterPrimary] = useState("");
  const [filterSecondary, setFilterSecondary] = useState("");
  const [filterMelee, setFilterMelee] = useState("");
  const [filterUtility, setFilterUtility] = useState("");

  useEffect(() => {
    const init = async () => {
      const authed = await base44.auth.isAuthenticated();
      if (authed) {
        const me = await base44.auth.me();
        setUser(me);
        const userVotes = await base44.entities.Vote.filter({ user_email: me.email });
        setVotes(userVotes);
      }
      const all = await base44.entities.Loadout.list("-upvotes", 20);
      setLoadouts(all.filter((l) => !l.is_banned));
      setLoading(false);
    };
    init();
  }, []);

  const handleVote = async (loadout) => {
    if (!user) { base44.auth.redirectToLogin(); return; }
    const alreadyVoted = votes.find((v) => v.loadout_id === loadout.id);
    if (alreadyVoted) return;
    await base44.entities.Vote.create({ loadout_id: loadout.id, user_email: user.email });
    await base44.entities.Loadout.update(loadout.id, { upvotes: (loadout.upvotes || 0) + 1 });
    setVotes((prev) => [...prev, { loadout_id: loadout.id, user_email: user.email }]);
    setLoadouts((prev) => prev.map((l) => l.id === loadout.id ? { ...l, upvotes: (l.upvotes || 0) + 1 } : l));
  };

  const filtered = loadouts.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.title?.toLowerCase().includes(q) || l.author_name?.toLowerCase().includes(q) || l.notes?.toLowerCase().includes(q);
    const matchPrimary = !filterPrimary || l.primary_weapon === filterPrimary;
    const matchSecondary = !filterSecondary || l.secondary_weapon === filterSecondary;
    const matchMelee = !filterMelee || l.melee === filterMelee;
    const matchUtility = !filterUtility || l.utility === filterUtility;
    return matchSearch && matchPrimary && matchSecondary && matchMelee && matchUtility;
  });

  const hasFilters = search || filterPrimary || filterSecondary || filterMelee || filterUtility;
  const clearFilters = () => { setSearch(""); setFilterPrimary(""); setFilterSecondary(""); setFilterMelee(""); setFilterUtility(""); };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-primary/20 border border-primary/40 rounded flex items-center justify-center">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-rajdhani text-4xl font-700 text-foreground uppercase tracking-widest glow-text">
              Top Builds
            </h1>
            <p className="text-sm text-muted-foreground">Most upvoted loadouts from the community</p>
          </div>
        </div>

        {/* Podium for top 3 */}
        {!loading && loadouts.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-10">
            {loadouts.slice(0, 3).map((loadout, i) => (
              <div key={loadout.id} className={`relative bg-card border rounded-lg p-4 text-center ${
                i === 0 ? "border-yellow-500/50 shadow-lg shadow-yellow-500/10" :
                i === 1 ? "border-slate-400/50" : "border-amber-700/50"
              }`}>
                <div className="text-3xl mb-2">{MEDAL[i]}</div>
                <p className="font-rajdhani font-700 text-foreground text-sm uppercase tracking-wider truncate">{loadout.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{loadout.upvotes || 0} votes</p>
              </div>
            ))}
          </div>
        )}

        {/* Search & Filters */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search loadouts, authors..."
              className="pl-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Primary", value: filterPrimary, set: setFilterPrimary, opts: PRIMARY_WEAPONS },
              { label: "Secondary", value: filterSecondary, set: setFilterSecondary, opts: SECONDARY_WEAPONS },
              { label: "Melee", value: filterMelee, set: setFilterMelee, opts: MELEE_OPTIONS },
              { label: "Utility", value: filterUtility, set: setFilterUtility, opts: UTILITY_OPTIONS },
            ].map(({ label, value, set, opts }) => (
              <Select key={label} value={value} onValueChange={set}>
                <SelectTrigger className="bg-secondary border-border text-foreground text-xs h-8">
                  <SelectValue placeholder={`Any ${label}`} />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-60">
                  {opts.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            ))}
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 mb-6">
          <h2 className="font-rajdhani text-xl text-foreground uppercase tracking-wider">All Rankings</h2>
          {hasFilters && <span className="text-xs text-muted-foreground">({filtered.length} result{filtered.length !== 1 ? "s" : ""})</span>}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.length === 0 ? (
              <div className="col-span-3 text-center py-16 text-muted-foreground">No loadouts match your filters.</div>
            ) : filtered.map((loadout) => (
              <LoadoutCard
                key={loadout.id}
                loadout={loadout}
                onVote={handleVote}
                userVoted={!!votes.find((v) => v.loadout_id === loadout.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
