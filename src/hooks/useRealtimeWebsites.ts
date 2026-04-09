import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useRealtimeWebsites(onUpdate: () => void) {
  useEffect(() => {
    const channel = supabase
      .channel('websites-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'websites' },
        () => onUpdate()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate]);
}
