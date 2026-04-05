import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, Globe, ShoppingCart, Rocket, Hammer, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/listings', icon: Globe, label: 'My Listings' },
  { to: '/admin/buy-requests', icon: ShoppingCart, label: 'Buy Requests', countKey: 'buy' },
  { to: '/admin/deploy-requests', icon: Rocket, label: 'Deploy Requests', countKey: 'deploy' },
  { to: '/admin/build-requests', icon: Hammer, label: 'Build Requests', countKey: 'build' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout() {
  const { isAdmin, loading, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    const [buy, deploy, build] = await Promise.all([
      supabase.from('buy_requests').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      supabase.from('deploy_requests').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      supabase.from('build_requests').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    ]);
    setCounts({ buy: buy.count || 0, deploy: deploy.count || 0, build: build.count || 0 });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAdmin) return <Navigate to="/admin" replace />;

  return (
    <div className="admin-mode min-h-screen flex bg-background">
      {/* Overlay for mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:sticky top-0 left-0 h-screen w-60 bg-card border-r border-border flex flex-col z-50 transition-transform lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="p-5 border-b border-border">
          <Link to="/admin/dashboard" className="font-display text-xl font-bold text-primary">NexusGrid</Link>
          <p className="text-xs text-muted-foreground mt-0.5">Admin Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label, countKey }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                  active
                    ? 'admin-sidebar-active font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{label}</span>
                {countKey && counts[countKey] > 0 && (
                  <span className="badge-new text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{counts[countKey]}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <button onClick={signOut} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground w-full">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-card border-b border-border h-14 flex items-center px-4 lg:px-6">
          <button className="lg:hidden mr-3" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <p className="text-sm font-medium text-foreground capitalize">
            {location.pathname.split('/').pop()?.replace(/-/g, ' ')}
          </p>
        </header>
        <main className="flex-1 p-4 lg:p-6 bg-muted/30">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
