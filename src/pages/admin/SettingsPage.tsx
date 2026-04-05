import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const updatePassword = async () => {
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Password updated');
    setPassword('');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader><CardTitle>Account</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm mb-1.5 block">Email</Label>
              <Input value={user?.email || ''} disabled className="bg-muted/50" />
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">New Password</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep current" />
            </div>
            <Button onClick={updatePassword} disabled={saving || !password}>
              {saving ? 'Saving...' : 'Update Password'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Platform Info</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">NexusGrid Marketplace — Built by CaselGrid</p>
            <p className="text-sm text-muted-foreground mt-1">Contact: <a href="https://caselgrid.tech" target="_blank" rel="noopener noreferrer" className="text-primary underline">caselgrid.tech</a></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
