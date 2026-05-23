import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/loadouts/HeroSection";
import LoadoutCard from "@/components/loadouts/LoadoutCard";
import LoadoutFilters from "@/components/loadouts/LoadoutFilters";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [loadouts, setLoadouts] = useState([]);
  const [votes, setVotes] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [playstyle, setPlaystyle] = useState("all");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    const init = async () => {
      const authed = await base44.auth.isAuthenticated();
      if (authed) {
        const me = await base44.auth.me();
        setUser(me);
        const userVotes = await base44.entities.Vote.filter({ user_email: me.email });
        setVotes(userVotes);
      }
      const all = await base44.entities.Loadout.list("-created_date", 100);
      setLoadouts(all.filter((l) => !l.is_banned));
      setLoading(false);
    };
    init();
  }, []);

  const handleVote = async (loadout) => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }
    const alreadyVoted = votes.find((v) => v.loadout_id === loadout.id);
    if (alreadyVoted) return;

    await base44.entities.Vote.create({ loadout_id: loadout.id, user_email: user.email });
    await base44.entities.Loadout.update(loadout.id, { upvotes: (loadout.upvotes || 0) + 1 });

    setVotes((prev) => [...prev, { loadout_id: loadout.id, user_email: user.email }]);
    setLoadouts((prev) =>
      prev.map((l) => l.id === loadout.id ? { ...l, upvotes: (l.upvotes || 0) + 1 } : l)
    );
  };

  const filtered = loadouts
    .filter((l) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        l.title?.toLowerCase().includes(q) ||
        l.primary_weapon?.toLowerCase().includes(q) ||
        l.secondary_weapon?.toLowerCase().includes(q) ||
        l.notes?.toLowerCase().includes(q);
      const matchPlaystyle = playstyle === "all" || l.playstyle === playstyle;
      return matchSearch && matchPlaystyle;
    })
    .sort((a, b) => {
      if (sort === "top") return (b.upvotes || 0) - (a.upvotes || 0);
      return new Date(b.created_date) - new Date(a.created_date);
    });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection isAuthenticated={!!user} />

      <div id="loadouts" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="font-rajdhani text-2xl font-700 text-foreground uppercase tracking-wider">
            Community Loadouts
          </h2>
          <span className="text-xs text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded">
            {filtered.length}
          </span>
        </div>

        <LoadoutFilters
          search={search}
          setSearch={setSearch}
          playstyle={playstyle}
          setPlaystyle={setPlaystyle}
          sort={sort}
          setSort={setSort}
        />

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-inter">No loadouts found. Be the first to submit!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((loadout) => (
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
