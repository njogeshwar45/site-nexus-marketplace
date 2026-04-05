import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ExternalLink, X } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';

interface Website {
  id: string;
  name: string;
  short_description: string;
  category: string;
  tech_stack: string[];
  tags: string[];
  price: number;
  thumbnail_url: string | null;
  status: string;
}

export default function MarketplacePage() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [quizPrefs, setQuizPrefs] = useState<string[] | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('nexusgrid_quiz');
    if (stored) setQuizPrefs(JSON.parse(stored));
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    const { data } = await supabase.from('websites').select('*').eq('status', 'available');
    setWebsites((data as Website[]) || []);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    let results = websites;
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(w => w.name.toLowerCase().includes(q) || w.short_description.toLowerCase().includes(q));
    }
    if (category !== 'all') results = results.filter(w => w.category === category);
    if (priceRange !== 'all') {
      const ranges: Record<string, [number, number]> = {
        'under500': [0, 500],
        '500-1500': [500, 1500],
        '1500-5000': [1500, 5000],
        '5000+': [5000, Infinity],
      };
      const [min, max] = ranges[priceRange];
      results = results.filter(w => w.price >= min && w.price < max);
    }
    // Sort by quiz relevance
    if (quizPrefs) {
      const quizTags = quizPrefs.map(p => p.toLowerCase());
      results = [...results].sort((a, b) => {
        const scoreA = a.tags.filter(t => quizTags.some(q => t.includes(q) || q.includes(t))).length;
        const scoreB = b.tags.filter(t => quizTags.some(q => t.includes(q) || q.includes(t))).length;
        return scoreB - scoreA;
      });
    }
    return results;
  }, [websites, search, category, priceRange, quizPrefs]);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="font-display text-xl font-bold gradient-text">NexusGrid</Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Home</Link>
            <Link to="/marketplace" className="text-foreground font-medium text-sm">Marketplace</Link>
            <Link to="/request-deploy" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Deploy</Link>
            <Link to="/request-build" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Custom Build</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Marketplace</h1>
        <p className="text-muted-foreground mb-8">Discover premium, production-ready websites.</p>

        {/* Quiz banner */}
        {quizPrefs && (
          <div className="glass rounded-xl p-4 mb-6 flex items-center justify-between">
            <p className="text-sm"><span className="gradient-text font-medium">Showing results based on your interests</span></p>
            <Button variant="ghost" size="sm" onClick={() => { localStorage.removeItem('nexusgrid_quiz'); setQuizPrefs(null); }}>
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search websites..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-muted/30 border-border" />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-[180px] bg-muted/30 border-border"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="w-full sm:w-[180px] bg-muted/30 border-border"><SelectValue placeholder="Price" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="under500">Under $500</SelectItem>
              <SelectItem value="500-1500">$500 – $1,500</SelectItem>
              <SelectItem value="1500-5000">$1,500 – $5,000</SelectItem>
              <SelectItem value="5000+">$5,000+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card rounded-xl h-80 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No websites found matching your criteria.</p>
            <Button variant="outline" className="mt-4" onClick={() => { setSearch(''); setCategory('all'); setPriceRange('all'); }}>Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((w) => (
              <Link to={`/website/${w.id}`} key={w.id}>
                <GlassCard className="h-full">
                  <div className="w-full h-40 rounded-lg overflow-hidden mb-4 bg-muted/20">
                    {w.thumbnail_url && (
                      <img src={w.thumbnail_url} alt={w.name} className="w-full h-full object-cover" loading="lazy" />
                    )}
                  </div>
                  <div className="flex gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">{w.category}</span>
                    {w.tech_stack?.[0] && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/20 text-secondary">{w.tech_stack[0]}</span>
                    )}
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-1">{w.name}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{w.short_description}</p>
                  <div className="flex items-center justify-between">
                    <p className="font-display font-bold text-xl">${w.price.toLocaleString()}</p>
                    <span className="gradient-btn text-primary-foreground text-sm px-4 py-2 rounded-lg flex items-center gap-1">
                      View <ExternalLink className="h-3 w-3" />
                    </span>
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
