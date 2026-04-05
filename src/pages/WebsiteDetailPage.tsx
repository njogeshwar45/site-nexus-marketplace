import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, ExternalLink, Check, Code, FileText, Headphones, Key } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

interface Website {
  id: string;
  name: string;
  short_description: string;
  full_description: string | null;
  category: string;
  tech_stack: string[];
  tags: string[];
  price: number;
  preview_url: string | null;
  thumbnail_url: string | null;
  features: string[];
  status: string;
}

const enquirySchema = z.object({
  buyer_name: z.string().trim().min(1, 'Name is required').max(100),
  buyer_email: z.string().trim().email('Valid email required').max(255),
  buyer_phone: z.string().max(20).optional(),
  message: z.string().trim().max(1000).optional(),
});

export default function WebsiteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [website, setWebsite] = useState<Website | null>(null);
  const [related, setRelated] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyOpen, setBuyOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ buyer_name: '', buyer_email: '', buyer_phone: '', message: '' });

  useEffect(() => {
    if (id) fetchWebsite();
  }, [id]);

  const fetchWebsite = async () => {
    const { data } = await supabase.from('websites').select('*').eq('id', id!).maybeSingle();
    if (data) {
      setWebsite(data as Website);
      const { data: rel } = await supabase.from('websites').select('*').eq('category', data.category).neq('id', data.id).eq('status', 'available').limit(3);
      setRelated((rel as Website[]) || []);
    }
    setLoading(false);
  };

  const handleBuy = async () => {
    const result = enquirySchema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('buy_requests').insert({
      ...result.data,
      website_id: id,
      status: 'new',
    });
    setSubmitting(false);
    if (error) { toast.error('Something went wrong'); return; }
    setSubmitted(true);
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!website) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Website not found.</p></div>;

  const INCLUDES = [
    { icon: Code, label: 'Full source code' },
    { icon: FileText, label: 'Documentation' },
    { icon: Headphones, label: '30-day support' },
    { icon: Key, label: 'Full ownership transfer' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="font-display text-xl font-bold gradient-text">NexusGrid</Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Home</Link>
            <Link to="/marketplace" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Marketplace</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
        <Link to="/marketplace" className="inline-flex items-center text-muted-foreground hover:text-foreground text-sm mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Marketplace
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Preview image */}
            <div className="w-full aspect-video rounded-xl overflow-hidden bg-muted/20 mb-6">
              {website.thumbnail_url && <img src={website.thumbnail_url} alt={website.name} className="w-full h-full object-cover" />}
            </div>
            {website.preview_url && (
              <a href={website.preview_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="glass border-glass-border mb-8">
                  Preview Site <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
            )}

            <h1 className="font-display text-3xl font-bold mb-3">{website.name}</h1>
            <p className="text-muted-foreground mb-6 leading-relaxed">{website.full_description || website.short_description}</p>

            <div className="flex flex-wrap gap-2 mb-6">
              {website.tech_stack?.map(t => (
                <span key={t} className="text-xs px-3 py-1 rounded-full bg-secondary/20 text-secondary">{t}</span>
              ))}
            </div>

            {website.features?.length > 0 && (
              <div className="mb-8">
                <h3 className="font-display font-semibold text-lg mb-3">Features</h3>
                <ul className="space-y-2">
                  {website.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-secondary flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <GlassCard hover={false}>
              <p className="font-display text-4xl font-bold gradient-text mb-4">${website.price.toLocaleString()}</p>
              <Button className="gradient-btn text-primary-foreground w-full py-6 text-lg rounded-xl border-0" onClick={() => setBuyOpen(true)}>
                Buy Now
              </Button>
            </GlassCard>

            <GlassCard hover={false}>
              <h3 className="font-display font-semibold mb-4">What's Included</h3>
              <div className="space-y-3">
                {INCLUDES.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Icon className="h-4 w-4 text-primary flex-shrink-0" /> {label}
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold mb-6">Related Websites</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map(w => (
                <Link to={`/website/${w.id}`} key={w.id}>
                  <GlassCard>
                    <div className="w-full h-32 rounded-lg overflow-hidden mb-3 bg-muted/20">
                      {w.thumbnail_url && <img src={w.thumbnail_url} alt={w.name} className="w-full h-full object-cover" loading="lazy" />}
                    </div>
                    <h3 className="font-display font-semibold">{w.name}</h3>
                    <p className="text-muted-foreground text-sm">${w.price.toLocaleString()}</p>
                  </GlassCard>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Buy Modal */}
      <Dialog open={buyOpen} onOpenChange={setBuyOpen}>
        <DialogContent className="glass border-glass-border sm:max-w-md">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Request Received!</h3>
              <p className="text-muted-foreground text-sm">We'll reach out to you within 24 hours to complete the purchase.</p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Purchase Enquiry</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Your Name *" value={form.buyer_name} onChange={e => setForm(f => ({ ...f, buyer_name: e.target.value }))} className="bg-muted/30 border-border" />
                <Input placeholder="Email Address *" type="email" value={form.buyer_email} onChange={e => setForm(f => ({ ...f, buyer_email: e.target.value }))} className="bg-muted/30 border-border" />
                <Input placeholder="Phone (optional)" value={form.buyer_phone} onChange={e => setForm(f => ({ ...f, buyer_phone: e.target.value }))} className="bg-muted/30 border-border" />
                <Textarea placeholder="Message (optional)" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="bg-muted/30 border-border" />
                <Button className="gradient-btn text-primary-foreground w-full rounded-xl border-0" onClick={handleBuy} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Enquiry'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
