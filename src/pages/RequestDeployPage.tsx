import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/GlassCard';
import { Check, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { BUDGET_RANGES_DEPLOY, TIMELINES_DEPLOY, HOSTING_OPTIONS } from '@/lib/constants';

const schema = z.object({
  full_name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Valid email required').max(255),
  phone: z.string().max(20).optional(),
  project_name: z.string().trim().min(1, 'Project name is required').max(100),
  current_url: z.string().max(500).optional(),
  github_url: z.string().max(500).optional(),
  website_type: z.string().optional(),
  hosting_preference: z.string().optional(),
  domain_status: z.string().optional(),
  requirements: z.string().max(2000).optional(),
  budget_range: z.string().optional(),
  timeline: z.string().optional(),
});

const WEBSITE_TYPES = ['React App', 'WordPress', 'HTML-CSS', 'Next.js', 'Vue', 'Laravel', 'Other'];

export default function RequestDeployPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', project_name: '', current_url: '', github_url: '',
    website_type: '', hosting_preference: '', domain_status: 'not-sure', requirements: '',
    budget_range: '', timeline: '',
  });

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    const result = schema.safeParse(form);
    if (!result.success) { toast.error(result.error.issues[0].message); return; }
    setSubmitting(true);
    const { error } = await supabase.from('deploy_requests').insert({ ...form, status: 'new' });
    setSubmitting(false);
    if (error) { toast.error('Something went wrong'); return; }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <GlassCard hover={false} className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-secondary" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Request Received!</h2>
          <p className="text-muted-foreground text-sm mb-6">We'll reach out within 24 hours.</p>
          <Link to="/"><Button variant="outline" className="glass border-glass-border">Back to Home</Button></Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="font-display text-xl font-bold gradient-text">NexusGrid</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground text-sm mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Link>
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Get Your Website <span className="gradient-text">Deployed by Experts</span></h1>
        <p className="text-muted-foreground mb-8">Already have a website built? Let our team deploy, host, and maintain it for you.</p>

        <GlassCard hover={false} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label className="text-sm mb-1.5 block">Full Name *</Label><Input value={form.full_name} onChange={e => set('full_name', e.target.value)} className="bg-muted/30 border-border" /></div>
            <div><Label className="text-sm mb-1.5 block">Email *</Label><Input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="bg-muted/30 border-border" /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label className="text-sm mb-1.5 block">Phone</Label><Input value={form.phone} onChange={e => set('phone', e.target.value)} className="bg-muted/30 border-border" /></div>
            <div><Label className="text-sm mb-1.5 block">Project Name *</Label><Input value={form.project_name} onChange={e => set('project_name', e.target.value)} className="bg-muted/30 border-border" /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label className="text-sm mb-1.5 block">Current URL</Label><Input value={form.current_url} onChange={e => set('current_url', e.target.value)} className="bg-muted/30 border-border" placeholder="https://..." /></div>
            <div><Label className="text-sm mb-1.5 block">GitHub URL</Label><Input value={form.github_url} onChange={e => set('github_url', e.target.value)} className="bg-muted/30 border-border" placeholder="https://github.com/..." /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm mb-1.5 block">Website Type</Label>
              <Select value={form.website_type} onValueChange={v => set('website_type', v)}>
                <SelectTrigger className="bg-muted/30 border-border"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{WEBSITE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Hosting Preference</Label>
              <Select value={form.hosting_preference} onValueChange={v => set('hosting_preference', v)}>
                <SelectTrigger className="bg-muted/30 border-border"><SelectValue placeholder="Select hosting" /></SelectTrigger>
                <SelectContent>{HOSTING_OPTIONS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-sm mb-2 block">Domain</Label>
            <RadioGroup value={form.domain_status} onValueChange={v => set('domain_status', v)} className="flex gap-4">
              {[['have', 'I have a domain'], ['need', 'I need a domain'], ['not-sure', 'Not sure']].map(([v, l]) => (
                <div key={v} className="flex items-center gap-2">
                  <RadioGroupItem value={v} id={`domain-${v}`} />
                  <Label htmlFor={`domain-${v}`} className="text-sm">{l}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div><Label className="text-sm mb-1.5 block">Requirements</Label><Textarea value={form.requirements} onChange={e => set('requirements', e.target.value)} className="bg-muted/30 border-border" rows={4} /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm mb-1.5 block">Budget Range</Label>
              <Select value={form.budget_range} onValueChange={v => set('budget_range', v)}>
                <SelectTrigger className="bg-muted/30 border-border"><SelectValue placeholder="Select budget" /></SelectTrigger>
                <SelectContent>{BUDGET_RANGES_DEPLOY.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Timeline</Label>
              <Select value={form.timeline} onValueChange={v => set('timeline', v)}>
                <SelectTrigger className="bg-muted/30 border-border"><SelectValue placeholder="Select timeline" /></SelectTrigger>
                <SelectContent>{TIMELINES_DEPLOY.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <Button className="gradient-btn text-primary-foreground w-full py-5 rounded-xl border-0 text-base" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Deploy Request'}
          </Button>
        </GlassCard>
      </div>
    </div>
  );
}
