import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LoadoutFilters({ search, setSearch, playstyle, setPlaystyle, sort, setSort }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-8">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search loadouts, weapons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <Select value={playstyle} onValueChange={setPlaystyle}>
        <SelectTrigger className="w-full sm:w-40 bg-secondary border-border text-foreground">
          <Filter className="w-3 h-3 mr-2 text-muted-foreground" />
          <SelectValue placeholder="Playstyle" />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          <SelectItem value="all">All Styles</SelectItem>
          <SelectItem value="Aggressive">Aggressive</SelectItem>
          <SelectItem value="Defensive">Defensive</SelectItem>
          <SelectItem value="Balanced">Balanced</SelectItem>
          <SelectItem value="Support">Support</SelectItem>
          <SelectItem value="Sniper">Sniper</SelectItem>
        </SelectContent>
      </Select>
      <Select value={sort} onValueChange={setSort}>
        <SelectTrigger className="w-full sm:w-40 bg-secondary border-border text-foreground">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="top">Top Voted</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
