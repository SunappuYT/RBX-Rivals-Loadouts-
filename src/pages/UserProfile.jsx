import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Navbar from "@/components/layout/Navbar";
import { Loader2, User, Award, Target } from "lucide-react";
import { Link } from "react-router-dom";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loadouts, setLoadouts] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (!authed) { base44.auth.redirectToLogin(); return; }
      const me = await base44.auth.me();
      setUser(me);
      const [allLoadouts, allBadges] = await Promise.all([
        base44.entities.Loadout.filter({ created_by: me.email }),
        base44.entities.UserBadge.filter({ user_email: me.email }),
      ]);
      setLoadouts(allLoadouts);
      setBadges(allBadges);
      setLoading(false);
    });
  }, []);

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
      <div className="max-w-4xl mx-auto px-4 pt-28 pb-20">
        {/* Profile Header */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="font-rajdhani text-2xl font-700 text-foreground uppercase tracking-wider">
              {user?.full_name || user?.email}
            </h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">{user?.role || "Member"}</p>
          </div>
          <div className="ml-auto flex gap-4 text-center">
            <div className="bg-secondary border border-border rounded-lg px-4 py-3">
              <p className="font-rajdhani text-2xl font-700 text-primary">{loadouts.length}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Submissions</p>
            </div>
            <div className="bg-secondary border border-border rounded-lg px-4 py-3">
              <p className="font-rajdhani text-2xl font-700 text-primary">{badges.length}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Badges</p>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="font-rajdhani text-lg font-700 text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" /> Badges
          </h2>
          {badges.length === 0 ? (
            <p className="text-sm text-muted-foreground">No badges earned yet.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-2 bg-secondary border border-border rounded-lg px-3 py-2"
                >
                  <span className="text-xl">{badge.badge_emoji || "🏅"}</span>
                  <span className="font-rajdhani text-sm font-700 text-foreground tracking-wide">{badge.badge_name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submissions */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-rajdhani text-lg font-700 text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" /> My Loadouts
          </h2>
          {loadouts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No loadouts submitted yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {loadouts.map((loadout) => (
                <Link
                  key={loadout.id}
                  to={`/loadout/${loadout.id}`}
                  className="flex items-center justify-between py-3 hover:text-primary transition-colors group"
                >
                  <div>
                    <p className="font-rajdhani font-700 text-foreground group-hover:text-primary tracking-wide">{loadout.title}</p>
                    <p className="text-xs text-muted-foreground">{loadout.primary_weapon} • {loadout.upvotes || 0} votes</p>
                  </div>
                  {loadout.is_banned && (
                    <span className="text-xs bg-destructive/20 border border-destructive/40 text-destructive px-2 py-0.5 rounded">Banned</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
