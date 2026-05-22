import { Swords, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";

export default function HeroSection({ isAuthenticated }) {
  return (
    <div className="relative overflow-hidden pt-28 pb-16 px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-background" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded px-3 py-1 mb-6">
          <Zap className="w-3 h-3 text-primary" />
          <span className="text-xs font-inter text-primary tracking-widest uppercase">Fan-Made Community Hub</span>
        </div>

        <img src="https://media.base44.com/images/public/6a082e74700377b84a59f384/ce99cf23b_download.png" alt="RIVALS LOADOUTS" className="h-40 sm:h-56 w-auto mx-auto mb-4" />

        <p className="text-muted-foreground font-inter text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          Discover and share the best competitive loadouts for RIVALS. 
          Browse weapon setups, sensitivities, and pro strategies from the community.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          {isAuthenticated ? (
            <Link to="/submit">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary font-rajdhani tracking-widest uppercase px-8">
                <Swords className="w-4 h-4 mr-2" /> Submit Loadout
              </Button>
            </Link>
          ) : (
            <Button
              onClick={() => base44.auth.redirectToLogin()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary font-rajdhani tracking-widest uppercase px-8"
            >
              <Swords className="w-4 h-4 mr-2" /> Submit Your Loadout
            </Button>
          )}
          <a href="#loadouts">
            <Button variant="outline" className="border-border text-muted-foreground hover:text-foreground hover:border-primary/40 font-rajdhani tracking-widest uppercase px-8">
              <Shield className="w-4 h-4 mr-2" /> Browse Builds
            </Button>
          </a>
        </div>

        {/* Stats strip */}
        <div className="flex justify-center gap-8 mt-12 pt-8 border-t border-border">
          {[
            { label: "Community Loadouts", icon: Swords },
            { label: "Active Players", icon: Shield },
            { label: "Meta Builds", icon: Zap },
          ].map(({ label, icon: Icon }) => (
            <div key={label} className="text-center">
              <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
