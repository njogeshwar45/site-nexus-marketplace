import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { StatusBadge } from '@/components/StatusBadge';
import { DEPLOY_STATUSES } from '@/lib/constants';
import { toast } from 'sonner';

interface DeployRequest {
  id: string; full_name: string; email: string; phone: string | null;
  project_name: string; current_url: string | null; github_url: string | null;
  website_type: string | null; hosting_preference: string | null;
  domain_status: string | null; requirements: string | null;
  budget_range: string | null; timeline: string | null;
  status: string; admin_notes: string | null; created_at: string;
}

export default function DeployRequestsPage() {
  const [requests, setRequests] = useState<DeployRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DeployRequest | null>(null);
  const [notes, setNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    const { data } = await supabase.from('deploy_requests').select('*').order('created_at', { ascending: false });
    setRequests((data as DeployRequest[]) || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('deploy_requests').update({ status }).eq('id', id);
    toast.success('Updated');
    fetch();
    if (selected?.id === id) setSelected(s => s ? { ...s, status } : null);
  };

  const saveNotes = async () => {
    if (!selected) return;
    await supabase.from('deploy_requests').update({ admin_notes: notes }).eq('id', selected.id);
    toast.success('Notes saved');
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Project', 'Type', 'Hosting', 'Budget', 'Timeline', 'Status', 'Date'];
    const rows = filtered.map(r => [r.full_name, r.email, r.project_name, r.website_type||'', r.hosting_preference||'', r.budget_range||'', r.timeline||'', r.status, new Date(r.created_at).toLocaleDateString()]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'deploy-requests.csv'; a.click();
  };

  const filtered = filterStatus === 'all' ? requests : requests.filter(r => r.status === filterStatus);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Deploy Requests</h1>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Filter" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {DEPLOY_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
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
              <TableHead>Project</TableHead>
              <TableHead>Type</TableHead>
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
                <TableCell>{r.project_name}</TableCell>
                <TableCell>{r.website_type || '—'}</TableCell>
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
              <SheetHeader><SheetTitle>Deploy Request Details</SheetTitle></SheetHeader>
              <div className="mt-6 space-y-4">
                <div><p className="text-xs text-muted-foreground">Name</p><p className="font-medium">{selected.full_name}</p></div>
                <div><p className="text-xs text-muted-foreground">Email</p><p>{selected.email}</p></div>
                {selected.phone && <div><p className="text-xs text-muted-foreground">Phone</p><p>{selected.phone}</p></div>}
                <div><p className="text-xs text-muted-foreground">Project</p><p>{selected.project_name}</p></div>
                {selected.current_url && <div><p className="text-xs text-muted-foreground">Current URL</p><a href={selected.current_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">{selected.current_url}</a></div>}
                {selected.github_url && <div><p className="text-xs text-muted-foreground">GitHub</p><a href={selected.github_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">{selected.github_url}</a></div>}
                <div><p className="text-xs text-muted-foreground">Type</p><p>{selected.website_type || '—'}</p></div>
                <div><p className="text-xs text-muted-foreground">Hosting</p><p>{selected.hosting_preference || '—'}</p></div>
                <div><p className="text-xs text-muted-foreground">Domain</p><p>{selected.domain_status || '—'}</p></div>
                {selected.requirements && <div><p className="text-xs text-muted-foreground">Requirements</p><p className="text-sm">{selected.requirements}</p></div>}
                <div><p className="text-xs text-muted-foreground">Budget</p><p>{selected.budget_range || '—'}</p></div>
                <div><p className="text-xs text-muted-foreground">Timeline</p><p>{selected.timeline || '—'}</p></div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Select value={selected.status} onValueChange={v => updateStatus(selected.id, v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DEPLOY_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Admin Notes</p>
                  <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
                  <Button size="sm" className="mt-2" onClick={saveNotes}>Save Notes</Button>
                </div>

                <a href={`mailto:${selected.email}?subject=Deploy Quote - ${selected.project_name}`}>
                  <Button className="w-full" variant="outline">Send Quote (Email)</Button>
                </a>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
