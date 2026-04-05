import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/GlassCard';
import { Check, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { BUDGET_RANGES_BUILD, TIMELINES_BUILD, DESIGN_STYLES, WEBSITE_TYPES_BUILD } from '@/lib/constants';

const schema = z.object({
  full_name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Valid email required').max(255),
});

export default function RequestBuildPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', company_name: '',
    website_types: [] as string[],
    tech_preference: '', key_features: '', design_style: '',
    has_mockup: false, reference_urls: '', budget_range: '',
    timeline: '', additional_notes: '',
  });

  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  const toggleType = (type: string) => {
    setForm(f => ({
      ...f,
      website_types: f.website_types.includes(type)
        ? f.website_types.filter(t => t !== type)
        : [...f.website_types, type],
    }));
  };

  const handleSubmit = async () => {
    const result = schema.safeParse(form);
    if (!result.success) { toast.error(result.error.issues[0].message); return; }
    setSubmitting(true);
    const { error } = await supabase.from('build_requests').insert({
      full_name: form.full_name, email: form.email, phone: form.phone || null,
      company_name: form.company_name || null, website_types: form.website_types,
      tech_preference: form.tech_preference || null, key_features: form.key_features || null,
      design_style: form.design_style || null, has_mockup: form.has_mockup,
      reference_urls: form.reference_urls || null, budget_range: form.budget_range || null,
      timeline: form.timeline || null, additional_notes: form.additional_notes || null,
      status: 'new',
    });
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
          <h2 className="font-display text-2xl font-bold mb-2">Project Brief Received!</h2>
          <p className="text-muted-foreground text-sm mb-6">Expect a reply within 24 hours.</p>
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
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Commission a <span className="gradient-text">Custom Website</span></h1>
        <p className="text-muted-foreground mb-8">Tell us what you need — we'll build it from scratch.</p>

        <GlassCard hover={false} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label className="text-sm mb-1.5 block">Full Name *</Label><Input value={form.full_name} onChange={e => set('full_name', e.target.value)} className="bg-muted/30 border-border" /></div>
            <div><Label className="text-sm mb-1.5 block">Email *</Label><Input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="bg-muted/30 border-border" /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label className="text-sm mb-1.5 block">Phone</Label><Input value={form.phone} onChange={e => set('phone', e.target.value)} className="bg-muted/30 border-border" /></div>
            <div><Label className="text-sm mb-1.5 block">Company / Brand</Label><Input value={form.company_name} onChange={e => set('company_name', e.target.value)} className="bg-muted/30 border-border" /></div>
          </div>

          <div>
            <Label className="text-sm mb-2 block">Website Types Needed</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {WEBSITE_TYPES_BUILD.map(type => (
                <div key={type} className="flex items-center gap-2">
                  <Checkbox checked={form.website_types.includes(type)} onCheckedChange={() => toggleType(type)} id={`type-${type}`} />
                  <Label htmlFor={`type-${type}`} className="text-sm">{type}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm mb-1.5 block">Tech Preference</Label>
              <Select value={form.tech_preference} onValueChange={v => set('tech_preference', v)}>
                <SelectTrigger className="bg-muted/30 border-border"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {['React', 'Next.js', 'WordPress', 'No preference', 'Let the team decide'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Design Style</Label>
              <Select value={form.design_style} onValueChange={v => set('design_style', v)}>
                <SelectTrigger className="bg-muted/30 border-border"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{DESIGN_STYLES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div><Label className="text-sm mb-1.5 block">Key Features Needed</Label><Textarea value={form.key_features} onChange={e => set('key_features', e.target.value)} className="bg-muted/30 border-border" placeholder="Login system, payment gateway, admin dashboard..." rows={3} /></div>

          <div>
            <Label className="text-sm mb-2 block">Do you have a design/mockup?</Label>
            <RadioGroup value={form.has_mockup ? 'yes' : 'no'} onValueChange={v => set('has_mockup', v === 'yes')} className="flex gap-6">
              <div className="flex items-center gap-2"><RadioGroupItem value="yes" id="mockup-yes" /><Label htmlFor="mockup-yes" className="text-sm">Yes</Label></div>
              <div className="flex items-center gap-2"><RadioGroupItem value="no" id="mockup-no" /><Label htmlFor="mockup-no" className="text-sm">No</Label></div>
            </RadioGroup>
          </div>

          <div><Label className="text-sm mb-1.5 block">Reference Websites</Label><Textarea value={form.reference_urls} onChange={e => set('reference_urls', e.target.value)} className="bg-muted/30 border-border" placeholder="Links to sites you like..." rows={2} /></div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm mb-1.5 block">Budget Range</Label>
              <Select value={form.budget_range} onValueChange={v => set('budget_range', v)}>
                <SelectTrigger className="bg-muted/30 border-border"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{BUDGET_RANGES_BUILD.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Timeline</Label>
              <Select value={form.timeline} onValueChange={v => set('timeline', v)}>
                <SelectTrigger className="bg-muted/30 border-border"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{TIMELINES_BUILD.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div><Label className="text-sm mb-1.5 block">Additional Notes</Label><Textarea value={form.additional_notes} onChange={e => set('additional_notes', e.target.value)} className="bg-muted/30 border-border" rows={3} /></div>

          <Button className="gradient-btn text-primary-foreground w-full py-5 rounded-xl border-0 text-base" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Project Brief'}
          </Button>
        </GlassCard>
      </div>
    </div>
  );
}
