import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error('Invalid credentials');
      return;
    }
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center gradient-mesh">
      <div className="glass-card rounded-2xl p-8 w-full max-w-sm">
        <h1 className="font-display text-2xl font-bold gradient-text text-center mb-6">NexusGrid Admin</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label className="text-sm mb-1.5 block">Email</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-muted/30 border-border" required />
          </div>
          <div>
            <Label className="text-sm mb-1.5 block">Password</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="bg-muted/30 border-border" required />
          </div>
          <Button type="submit" className="gradient-btn text-primary-foreground w-full rounded-xl border-0 py-5" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}
