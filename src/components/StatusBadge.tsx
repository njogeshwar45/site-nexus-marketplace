import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  new: 'badge-new',
  available: 'badge-sold',
  contacted: 'bg-blue-500 text-white',
  reviewing: 'bg-blue-500 text-white',
  negotiating: 'badge-pending',
  quoted: 'badge-pending',
  'proposal-sent': 'badge-pending',
  'in-progress': 'bg-blue-500 text-white',
  sold: 'badge-sold',
  deployed: 'badge-completed',
  completed: 'badge-completed',
  closed: 'badge-closed',
  rejected: 'badge-rejected',
  pending: 'badge-pending',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
      statusColors[status] || 'bg-gray-500 text-white'
    )}>
      {status.replace(/-/g, ' ')}
    </span>
  );
}
