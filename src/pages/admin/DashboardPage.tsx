import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, ShoppingCart, Rocket, Hammer, TrendingUp, Clock, CheckCircle, DollarSign } from 'lucide-react';

interface Metrics {
  totalListings: number;
  totalBuy: number;
  totalDeploy: number;
  totalBuild: number;
  newToday: number;
  pending: number;
  sold: number;
  revenue: number;
}

interface Activity {
  type: string;
  name: string;
  date: string;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics>({ totalListings: 0, totalBuy: 0, totalDeploy: 0, totalBuild: 0, newToday: 0, pending: 0, sold: 0, revenue: 0 });
  const [activity, setActivity] = useState<Activity[]>([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const today = new Date().toISOString().split('T')[0];
    const [listings, buyReqs, deployReqs, buildReqs, soldListings] = await Promise.all([
      supabase.from('websites').select('*'),
      supabase.from('buy_requests').select('*'),
      supabase.from('deploy_requests').select('*'),
      supabase.from('build_requests').select('*'),
      supabase.from('websites').select('price').eq('status', 'sold'),
    ]);

    const all = [
      ...(buyReqs.data || []).map(r => ({ type: 'Buy Request', name: r.buyer_name, date: r.created_at })),
      ...(deployReqs.data || []).map(r => ({ type: 'Deploy Request', name: r.full_name, date: r.created_at })),
      ...(buildReqs.data || []).map(r => ({ type: 'Build Request', name: r.full_name, date: r.created_at })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

    const newToday = all.filter(a => a.date.startsWith(today)).length;
    const pending = [
      ...(buyReqs.data || []).filter(r => r.status === 'new'),
      ...(deployReqs.data || []).filter(r => r.status === 'new'),
      ...(buildReqs.data || []).filter(r => r.status === 'new'),
    ].length;

    const revenue = (soldListings.data || []).reduce((sum, w) => sum + Number(w.price), 0);

    setMetrics({
      totalListings: (listings.data || []).filter(w => w.status === 'available').length,
      totalBuy: (buyReqs.data || []).length,
      totalDeploy: (deployReqs.data || []).length,
      totalBuild: (buildReqs.data || []).length,
      newToday,
      pending,
      sold: (soldListings.data || []).length,
      revenue,
    });
    setActivity(all);
  };

  const CARDS = [
    { label: 'Active Listings', value: metrics.totalListings, icon: Globe, color: 'text-primary' },
    { label: 'Buy Enquiries', value: metrics.totalBuy, icon: ShoppingCart, color: 'text-primary' },
    { label: 'Deploy Requests', value: metrics.totalDeploy, icon: Rocket, color: 'text-secondary' },
    { label: 'Build Requests', value: metrics.totalBuild, icon: Hammer, color: 'text-secondary' },
    { label: 'New Today', value: metrics.newToday, icon: TrendingUp, color: 'text-primary' },
    { label: 'Pending', value: metrics.pending, icon: Clock, color: 'text-amber-500' },
    { label: 'Completed / Sold', value: metrics.sold, icon: CheckCircle, color: 'text-green-500' },
    { label: 'Total Revenue', value: `$${metrics.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {CARDS.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <p className="text-muted-foreground text-sm">No recent activity.</p>
          ) : (
            <div className="space-y-3">
              {activity.map((a, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary mr-2">{a.type}</span>
                    <span className="text-sm">{a.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(a.date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
