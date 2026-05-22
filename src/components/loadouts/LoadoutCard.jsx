import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronUp, Target, Crosshair, User, Sword, Zap, Award, Flag, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const playstyleColors = {
  Aggressive: "bg-red-500/20 text-red-400 border-red-500/30",
  Defensive: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Balanced: "bg-green-500/20 text-green-400 border-green-500/30",
  Support: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Sniper: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const tierColors = {
  Bronze: "text-amber-700",
  Silver: "text-slate-400",
  Gold: "text-yellow-400",
  Platinum: "text-cyan-400",
  Diamond: "text-blue-400",
  Onyx: "text-slate-300",
  Nemesis: "text-primary",
  Archnemesis: "text-red-400",
};

export default function LoadoutCard({ loadout, onVote, userVoted }) {
  const [voting, setVoting] = useState(false);
  const navigate = useNavigate();

  const handleVote = async (e) => {
    e.stopPropagation();
    if (voting) return;
    setVoting(true);
    await onVote(loadout);
    setVoting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={() => navigate(`/loadout/${loadout.id}`)}
      className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/40 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 group cursor-pointer"
    >
      {/* Header bar */}
      <div className="h-0.5 bg-gradient-to-r from-primary/60 via-primary/20 to-transparent" />

      <div className="p-5">
        {/* Title + Vote */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            {loadout.special_title && (
              <div className="flex items-center gap-1 mb-1">
                <Award className="w-3 h-3 text-yellow-400" />
                <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">{loadout.special_title}</span>
              </div>
            )}
            <h3 className="font-rajdhani font-700 text-lg text-foreground tracking-wide group-hover:text-primary transition-colors truncate">
              {loadout.title}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <User className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{loadout.author_name || loadout.created_by || "Anonymous"}</span>
              {loadout.rank_tier && (
                <span className={`text-xs font-semibold ml-1 ${tierColors[loadout.rank_tier] || ""}`}>
                  • {loadout.rank_tier}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleVote}
            disabled={voting}
            className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-md border transition-all ${
              userVoted
                ? "bg-primary/20 border-primary/50 text-primary"
                : "bg-secondary border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
            }`}
          >
            <ChevronUp className={`w-4 h-4 ${userVoted ? "text-primary" : ""}`} />
            <span className="text-xs font-bold">{loadout.upvotes || 0}</span>
          </button>
        </div>

        {/* Weapons (compact) */}
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-1.5 bg-secondary rounded px-2.5 py-1.5 border border-border">
            <Target className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium text-foreground">{loadout.primary_weapon}</span>
          </div>
          {loadout.secondary_weapon && (
            <div className="flex items-center gap-1.5 bg-secondary rounded px-2.5 py-1.5 border border-border">
              <Crosshair className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">{loadout.secondary_weapon}</span>
            </div>
          )}
          {loadout.melee && (
            <div className="flex items-center gap-1.5 bg-secondary rounded px-2.5 py-1.5 border border-border">
              <Sword className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">{loadout.melee}</span>
            </div>
          )}
          {loadout.utility && (
            <div className="flex items-center gap-1.5 bg-secondary rounded px-2.5 py-1.5 border border-border">
              <Zap className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">{loadout.utility}</span>
            </div>
          )}
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between">
          {loadout.playstyle ? (
            <span className={`text-xs px-2 py-0.5 rounded border font-medium ${playstyleColors[loadout.playstyle]}`}>
              {loadout.playstyle}
            </span>
          ) : <span />}

          <span className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
            <ExternalLink className="w-3 h-3" /> Click to see more
          </span>
        </div>
      </div>
    </motion.div>
  );
}
