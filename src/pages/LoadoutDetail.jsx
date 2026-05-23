import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronUp, Target, Crosshair, User, Star, Sword, Zap, Award, Tag,
  Share2, Flag, ArrowLeft, Check, Loader2, X
} from "lucide-react";

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

function Slot({ SlotIcon, label, value, highlight }) {
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

export default function LoadoutDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loadout, setLoadout] = useState(null);
  const [user, setUser] = useState(null);
  const [userVoted, setUserVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);

  useEffect(() => {
    const init = async () => {
      const authed = await base44.auth.isAuthenticated();
      if (authed) {
        const me = await base44.auth.me();
        setUser(me);
        const votes = await base44.entities.Vote.filter({ loadout_id: id, user_email: me.email });
        setUserVoted(votes.length > 0);
      }
      const results = await base44.entities.Loadout.filter({ id });
      if (results.length > 0) setLoadout(results[0]);
      setLoading(false);
    };
    init();
  }, [id]);

  const handleVote = async () => {
    if (!user) { base44.auth.redirectToLogin(); return; }
    if (userVoted || voting) return;
    setVoting(true);
    await base44.entities.Vote.create({ loadout_id: loadout.id, user_email: user.email });
    await base44.entities.Loadout.update(loadout.id, { upvotes: (loadout.upvotes || 0) + 1 });
    setUserVoted(true);
    setLoadout((prev) => ({ ...prev, upvotes: (prev.upvotes || 0) + 1 }));
    setVoting(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReport = async () => {
    if (!user) { base44.auth.redirectToLogin(); return; }
    setReporting(true);
    await base44.entities.Report.create({
      loadout_id: loadout.id,
      loadout_title: loadout.title,
      reporter_email: user.email,
      reason: reportReason,
      resolved: false,
    });
    setReporting(false);
    setReported(true);
    setShowReport(false);
    setReportReason("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!loadout) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Loadout not found.</p>
          <Button variant="outline" onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-28 pb-20">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        {/* Card */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-primary/60 via-primary/20 to-transparent" />

          <div className="p-6 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {loadout.special_title && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <Award className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">{loadout.special_title}</span>
                  </div>
                )}
                <h1 className="font-rajdhani text-3xl font-700 text-foreground tracking-wide uppercase">
                  {loadout.title}
                </h1>
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
                disabled={voting || userVoted}
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

            {/* Loadout Slots */}
            <div>
              <p className="text-xs text-primary uppercase tracking-widest mb-2 font-rajdhani">Loadout Slots</p>
              <div className="grid grid-cols-2 gap-2">
                <Slot SlotIcon={Target} label="Primary" value={loadout.primary_weapon} highlight />
                <Slot SlotIcon={Crosshair} label="Secondary" value={loadout.secondary_weapon} />
                <Slot SlotIcon={Sword} label="Melee" value={loadout.melee} />
                <Slot SlotIcon={Zap} label="Utility" value={loadout.utility} />
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

            {/* Report Form */}
            {showReport && (
              <div className="border border-destructive/30 bg-destructive/5 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-rajdhani uppercase tracking-wider text-destructive">Report This Loadout</p>
                  <button onClick={() => setShowReport(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <Textarea
                  placeholder="Describe the issue (optional)..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none text-sm"
                  rows={3}
                />
                <Button
                  onClick={handleReport}
                  disabled={reporting}
                  size="sm"
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1.5"
                >
                  {reporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Flag className="w-3 h-3" />}
                  Submit Report
                </Button>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-border">
              <Button
                onClick={handleShare}
                variant="outline"
                className="gap-2 border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
                {copied ? "Copied!" : "Share"}
              </Button>

              {!reported ? (
                <button
                  onClick={() => setShowReport(!showReport)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors ml-auto"
                >
                  <Flag className="w-3.5 h-3.5" /> Report
                </button>
              ) : (
                <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-400" /> Reported
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
