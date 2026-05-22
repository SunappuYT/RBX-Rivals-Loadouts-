import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Swords, Menu, X, Plus } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        const me = await base44.auth.me();
        setUser(me);
      }
    });
  }, []);

  const navLinks = [
    { label: "Browse", path: "/" },
    { label: "Top Builds", path: "/top" },
    ...(user?.role === "admin" ? [{ label: "Admin", path: "/admin" }] : []),
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src="https://media.base44.com/images/public/6a082e74700377b84a59f384/ce99cf23b_download.png" alt="RIVALS LOADOUTS" className="h-10 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-inter text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/submit">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-rajdhani tracking-wider uppercase text-xs">
                    <Plus className="w-3 h-3" /> Submit Loadout
                  </Button>
                </Link>
                <Link to="/profile" className="text-xs text-muted-foreground hover:text-primary transition-colors">{user.full_name || user.email}</Link>
                <button
                  onClick={() => base44.auth.logout()}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => base44.auth.redirectToLogin()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-rajdhani tracking-wider uppercase text-xs"
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={`font-inter text-sm font-medium ${
                isActive(link.path) ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/submit" onClick={() => setMobileOpen(false)}>
                <Button size="sm" className="w-full bg-primary text-primary-foreground font-rajdhani tracking-wider uppercase text-xs">
                  <Plus className="w-3 h-3 mr-1" /> Submit Loadout
                </Button>
              </Link>
            </>
          ) : (
            <Button size="sm" onClick={() => base44.auth.redirectToLogin()} className="w-full bg-primary text-primary-foreground font-rajdhani uppercase text-xs">
              Sign In
            </Button>
          )}
        </div>
      )}
    </nav>
  );
}
