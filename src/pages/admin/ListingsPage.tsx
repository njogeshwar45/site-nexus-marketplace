import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeWebsites } from '@/hooks/useRealtimeWebsites';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { CATEGORIES } from '@/lib/constants';

interface Website {
  id: string; name: string; short_description: string; full_description: string | null;
  category: string; tech_stack: string[]; tags: string[]; price: number;
  preview_url: string | null; thumbnail_url: string | null; features: string[];
  status: string; created_at: string;
}

const EMPTY: Omit<Website, 'id' | 'created_at'> = {
  name: '', short_description: '', full_description: '', category: '',
  tech_stack: [], tags: [], price: 0, preview_url: '', thumbnail_url: '',
  features: [], status: 'available',
};

export default function ListingsPage() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Website | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [techInput, setTechInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [featuresInput, setFeaturesInput] = useState('');

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    const { data } = await supabase.from('websites').select('*').order('created_at', { ascending: false });
    setWebsites((data as Website[]) || []);
    setLoading(false);
  };

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY);
    setTechInput(''); setTagsInput(''); setFeaturesInput('');
    setDialogOpen(true);
  };

  const openEdit = (w: Website) => {
    setEditing(w);
    setForm({ ...w });
    setTechInput(w.tech_stack?.join(', ') || '');
    setTagsInput(w.tags?.join(', ') || '');
    setFeaturesInput(w.features?.join('\n') || '');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      ...form,
      tech_stack: techInput.split(',').map(s => s.trim()).filter(Boolean),
      tags: tagsInput.split(',').map(s => s.trim()).filter(Boolean),
      features: featuresInput.split('\n').map(s => s.trim()).filter(Boolean),
      price: Number(form.price),
    };
    if (!payload.name || !payload.short_description || !payload.category) {
      toast.error('Name, description, and category are required');
      return;
    }
    if (editing) {
      const { error } = await supabase.from('websites').update(payload).eq('id', editing.id);
      if (error) { toast.error('Failed to update'); return; }
      toast.success('Updated');
    } else {
      const { error } = await supabase.from('websites').insert([payload]);
      if (error) { toast.error('Failed to create'); return; }
      toast.success('Created');
    }
    setDialogOpen(false);
    fetch();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('websites').delete().eq('id', id);
    if (error) { toast.error('Failed to delete'); return; }
    toast.success('Deleted');
    fetch();
  };

  const toggleStatus = async (w: Website) => {
    const newStatus = w.status === 'available' ? 'sold' : 'available';
    await supabase.from('websites').update({ status: newStatus }).eq('id', w.id);
    fetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Listings</h1>
        <Button onClick={openNew} className="bg-primary text-primary-foreground"><Plus className="h-4 w-4 mr-1" /> Add Website</Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : websites.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No listings yet</TableCell></TableRow>
            ) : websites.map(w => (
              <TableRow key={w.id}>
                <TableCell className="font-medium">{w.name}</TableCell>
                <TableCell>{w.category}</TableCell>
                <TableCell>${Number(w.price).toLocaleString()}</TableCell>
                <TableCell>
                  <button onClick={() => toggleStatus(w)}><StatusBadge status={w.status} /></button>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(w.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(w)}><Pencil className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {w.name}?</AlertDialogTitle>
                          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(w.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Website' : 'Add New Website'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label className="text-sm mb-1.5 block">Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div>
                <Label className="text-sm mb-1.5 block">Category *</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className="text-sm mb-1.5 block">Short Description *</Label><Input value={form.short_description} onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))} /></div>
            <div><Label className="text-sm mb-1.5 block">Full Description</Label><Textarea value={form.full_description || ''} onChange={e => setForm(f => ({ ...f, full_description: e.target.value }))} rows={3} /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label className="text-sm mb-1.5 block">Price ($)</Label><Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} /></div>
              <div>
                <Label className="text-sm mb-1.5 block">Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className="text-sm mb-1.5 block">Preview URL</Label><Input value={form.preview_url || ''} onChange={e => setForm(f => ({ ...f, preview_url: e.target.value }))} /></div>
            <div><Label className="text-sm mb-1.5 block">Thumbnail URL</Label><Input value={form.thumbnail_url || ''} onChange={e => setForm(f => ({ ...f, thumbnail_url: e.target.value }))} /></div>
            <div><Label className="text-sm mb-1.5 block">Tech Stack (comma-separated)</Label><Input value={techInput} onChange={e => setTechInput(e.target.value)} placeholder="React, Node.js, Stripe" /></div>
            <div><Label className="text-sm mb-1.5 block">Tags (comma-separated)</Label><Input value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="e-commerce, react, saas" /></div>
            <div><Label className="text-sm mb-1.5 block">Features (one per line)</Label><Textarea value={featuresInput} onChange={e => setFeaturesInput(e.target.value)} rows={4} placeholder="Full source code&#10;Admin dashboard&#10;30-day support" /></div>
            <Button onClick={handleSave} className="w-full bg-primary text-primary-foreground">{editing ? 'Update' : 'Create'} Website</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
