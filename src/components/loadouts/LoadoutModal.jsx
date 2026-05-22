import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronUp, Target, Crosshair, User, Star, Sword, Zap, Award, Tag } from "lucide-react";

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

function Slot({ icon: SlotIcon, label, value, highlight }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 bg-secondary border border-border rounded px-3 py-2">
      <SlotIcon className={`w-4 h-4 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider leading-none mb-0.5">{label}</p>
        <p className={`text-sm font-medium ${highlight ? "text-foreground" : "text-foreground/80"}`}>{value}</p>
      </div>
    </div>
  );
}

export default function LoadoutModal({ loadout, open, onClose, onVote, userVoted }) {
  if (!loadout) return null;

  const handleVote = async (e) => {
    e.stopPropagation();
    await onVote(loadout);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg w-full">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/60 via-primary/20 to-transparent rounded-t-lg" />

        <DialogHeader className="pt-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {loadout.special_title && (
                <div className="flex items-center gap-1.5 mb-1">
                  <Award className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">{loadout.special_title}</span>
                </div>
              )}
              <DialogTitle className="font-rajdhani text-2xl text-foreground tracking-wide uppercase">
                {loadout.title}
              </DialogTitle>
              <div className="flex items-center gap-1.5 mt-1">
                <User className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{loadout.author_name || loadout.created_by || "Anonymous"}</span>
                {loadout.rank_tier && (
                  <span className={`text-xs font-semibold ml-1 ${tierColors[loadout.rank_tier] || "text-muted-foreground"}`}>
                    • {loadout.rank_tier}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleVote}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-md border transition-all shrink-0 ${
                userVoted
                  ? "bg-primary/20 border-primary/50 text-primary"
                  : "bg-secondary border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
              }`}
            >
              <ChevronUp className={`w-4 h-4 ${userVoted ? "text-primary" : ""}`} />
              <span className="text-xs font-bold">{loadout.upvotes || 0}</span>
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Loadout Slots */}
          <div>
            <p className="text-xs text-primary uppercase tracking-widest mb-2 font-rajdhani">Loadout Slots</p>
            <div className="grid grid-cols-2 gap-2">
              <Slot icon={Target} label="Primary" value={loadout.primary_weapon} highlight />
              <Slot icon={Crosshair} label="Secondary" value={loadout.secondary_weapon} />
              <Slot icon={Sword} label="Melee" value={loadout.melee} />
              <Slot icon={Zap} label="Utility" value={loadout.utility} />
            </div>
          </div>

          {/* Settings */}
          {(loadout.sensitivity || loadout.playstyle) && (
            <div>
              <p className="text-xs text-primary uppercase tracking-widest mb-2 font-rajdhani">Settings</p>
              <div className="flex flex-wrap gap-2">
                {loadout.sensitivity && (
                  <div className="flex items-center gap-2 bg-secondary border border-border rounded px-3 py-2">
                    <Star className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider leading-none mb-0.5">Sensitivity</p>
                      <p className="text-sm font-medium text-foreground">{loadout.sensitivity}</p>
                    </div>
                  </div>
                )}
                {loadout.playstyle && (
                  <div className={`flex items-center px-3 py-2 rounded border text-sm font-medium ${playstyleColors[loadout.playstyle]}`}>
                    {loadout.playstyle}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {loadout.notes && (
            <div>
              <p className="text-xs text-primary uppercase tracking-widest mb-2 font-rajdhani">Strategy & Notes</p>
              <p className="text-sm text-muted-foreground leading-relaxed bg-secondary border border-border rounded p-3">
                {loadout.notes}
              </p>
            </div>
          )}

          {/* Tags */}
          {loadout.tags && loadout.tags.length > 0 && (
            <div>
              <p className="text-xs text-primary uppercase tracking-widest mb-2 font-rajdhani">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {loadout.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded px-2 py-1">
                    <Tag className="w-2.5 h-2.5" />#{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
