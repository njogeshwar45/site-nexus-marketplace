import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { StatusBadge } from '@/components/StatusBadge';
import { BUILD_STATUSES } from '@/lib/constants';
import { toast } from 'sonner';

interface BuildRequest {
  id: string; full_name: string; email: string; phone: string | null;
  company_name: string | null; website_types: string[] | null;
  tech_preference: string | null; key_features: string | null;
  design_style: string | null; has_mockup: boolean | null;
  reference_urls: string | null; budget_range: string | null;
  timeline: string | null; additional_notes: string | null;
  status: string; admin_notes: string | null; created_at: string;
}

export default function BuildRequestsPage() {
  const [requests, setRequests] = useState<BuildRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BuildRequest | null>(null);
  const [notes, setNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    const { data } = await supabase.from('build_requests').select('*').order('created_at', { ascending: false });
    setRequests((data as BuildRequest[]) || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('build_requests').update({ status }).eq('id', id);
    toast.success('Updated');
    fetch();
    if (selected?.id === id) setSelected(s => s ? { ...s, status } : null);
  };

  const saveNotes = async () => {
    if (!selected) return;
    await supabase.from('build_requests').update({ admin_notes: notes }).eq('id', selected.id);
    toast.success('Notes saved');
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Company', 'Types', 'Budget', 'Timeline', 'Status', 'Date'];
    const rows = filtered.map(r => [r.full_name, r.email, r.company_name||'', (r.website_types||[]).join('; '), r.budget_range||'', r.timeline||'', r.status, new Date(r.created_at).toLocaleDateString()]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'build-requests.csv'; a.click();
  };

  const filtered = filterStatus === 'all' ? requests : requests.filter(r => r.status === filterStatus);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Build Requests</h1>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Filter" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {BUILD_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportCSV}>Export CSV</Button>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Types</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : filtered.map(r => (
              <TableRow key={r.id} className="cursor-pointer hover:bg-accent/50" onClick={() => { setSelected(r); setNotes(r.admin_notes || ''); }}>
                <TableCell className="font-medium">{r.full_name}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell>{r.company_name || '—'}</TableCell>
                <TableCell>{(r.website_types || []).join(', ') || '—'}</TableCell>
                <TableCell>{r.budget_range || '—'}</TableCell>
                <TableCell><StatusBadge status={r.status} /></TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader><SheetTitle>Build Request Details</SheetTitle></SheetHeader>
              <div className="mt-6 space-y-4">
                <div><p className="text-xs text-muted-foreground">Name</p><p className="font-medium">{selected.full_name}</p></div>
                <div><p className="text-xs text-muted-foreground">Email</p><p>{selected.email}</p></div>
                {selected.phone && <div><p className="text-xs text-muted-foreground">Phone</p><p>{selected.phone}</p></div>}
                {selected.company_name && <div><p className="text-xs text-muted-foreground">Company</p><p>{selected.company_name}</p></div>}
                <div>
                  <p className="text-xs text-muted-foreground">Website Types</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(selected.website_types || []).map(t => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{t}</span>
                    ))}
                  </div>
                </div>
                <div><p className="text-xs text-muted-foreground">Tech Preference</p><p>{selected.tech_preference || '—'}</p></div>
                {selected.key_features && <div><p className="text-xs text-muted-foreground">Key Features</p><p className="text-sm">{selected.key_features}</p></div>}
                <div><p className="text-xs text-muted-foreground">Design Style</p><p>{selected.design_style || '—'}</p></div>
                <div><p className="text-xs text-muted-foreground">Has Mockup</p><p>{selected.has_mockup ? 'Yes' : 'No'}</p></div>
                {selected.reference_urls && <div><p className="text-xs text-muted-foreground">References</p><p className="text-sm break-all">{selected.reference_urls}</p></div>}
                <div><p className="text-xs text-muted-foreground">Budget</p><p>{selected.budget_range || '—'}</p></div>
                <div><p className="text-xs text-muted-foreground">Timeline</p><p>{selected.timeline || '—'}</p></div>
                {selected.additional_notes && <div><p className="text-xs text-muted-foreground">Additional Notes</p><p className="text-sm">{selected.additional_notes}</p></div>}

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Select value={selected.status} onValueChange={v => updateStatus(selected.id, v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{BUILD_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Admin Notes</p>
                  <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
                  <Button size="sm" className="mt-2" onClick={saveNotes}>Save Notes</Button>
                </div>

                <a href={`mailto:${selected.email}?subject=Project Proposal - ${selected.company_name || selected.full_name}`}>
                  <Button className="w-full" variant="outline">Send Proposal (Email)</Button>
                </a>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
