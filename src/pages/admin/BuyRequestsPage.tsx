import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { StatusBadge } from '@/components/StatusBadge';
import { BUY_STATUSES } from '@/lib/constants';
import { toast } from 'sonner';

interface BuyRequest {
  id: string; buyer_name: string; buyer_email: string; buyer_phone: string | null;
  website_id: string | null; message: string | null; status: string;
  admin_notes: string | null; created_at: string;
  websites?: { name: string } | null;
}

export default function BuyRequestsPage() {
  const [requests, setRequests] = useState<BuyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BuyRequest | null>(null);
  const [notes, setNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    const { data } = await supabase.from('buy_requests').select('*, websites(name)').order('created_at', { ascending: false });
    setRequests((data as BuyRequest[]) || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('buy_requests').update({ status }).eq('id', id);
    if (status === 'sold' && selected?.website_id) {
      await supabase.from('websites').update({ status: 'sold' }).eq('id', selected.website_id);
    }
    toast.success('Updated');
    fetch();
    if (selected?.id === id) setSelected(s => s ? { ...s, status } : null);
  };

  const saveNotes = async () => {
    if (!selected) return;
    await supabase.from('buy_requests').update({ admin_notes: notes }).eq('id', selected.id);
    toast.success('Notes saved');
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Website', 'Message', 'Status', 'Date'];
    const rows = filtered.map(r => [r.buyer_name, r.buyer_email, r.buyer_phone || '', r.websites?.name || '', r.message || '', r.status, new Date(r.created_at).toLocaleDateString()]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'buy-requests.csv'; a.click();
  };

  const filtered = filterStatus === 'all' ? requests : requests.filter(r => r.status === filterStatus);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Buy Requests</h1>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Filter" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {BUY_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
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
              <TableHead>Website</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : filtered.map(r => (
              <TableRow key={r.id} className="cursor-pointer hover:bg-accent/50" onClick={() => { setSelected(r); setNotes(r.admin_notes || ''); }}>
                <TableCell className="font-medium">{r.buyer_name}</TableCell>
                <TableCell>{r.buyer_email}</TableCell>
                <TableCell>{r.websites?.name || '—'}</TableCell>
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
              <SheetHeader><SheetTitle>Buy Request Details</SheetTitle></SheetHeader>
              <div className="mt-6 space-y-4">
                <div><p className="text-xs text-muted-foreground">Name</p><p className="font-medium">{selected.buyer_name}</p></div>
                <div><p className="text-xs text-muted-foreground">Email</p><p>{selected.buyer_email}</p></div>
                {selected.buyer_phone && <div><p className="text-xs text-muted-foreground">Phone</p><p>{selected.buyer_phone}</p></div>}
                <div><p className="text-xs text-muted-foreground">Website</p><p>{selected.websites?.name || '—'}</p></div>
                {selected.message && <div><p className="text-xs text-muted-foreground">Message</p><p className="text-sm">{selected.message}</p></div>}
                <div><p className="text-xs text-muted-foreground">Date</p><p className="text-sm">{new Date(selected.created_at).toLocaleString()}</p></div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Select value={selected.status} onValueChange={v => updateStatus(selected.id, v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{BUY_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Admin Notes</p>
                  <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
                  <Button size="sm" className="mt-2" onClick={saveNotes}>Save Notes</Button>
                </div>

                {selected.status !== 'sold' && (
                  <Button className="w-full bg-green-600 text-primary-foreground hover:bg-green-700" onClick={() => updateStatus(selected.id, 'sold')}>
                    Mark as Sold
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
