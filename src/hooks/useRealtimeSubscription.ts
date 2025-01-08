import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

type TableName = 'tasks' | 'announcements' | 'leave_requests' | 'attendance' | 'profiles';
type Event = 'INSERT' | 'UPDATE' | 'DELETE';

interface UseRealtimeSubscriptionProps {
  table: TableName;
  events?: Event[];
  onData: (payload: any) => void;
}

export const useRealtimeSubscription = ({
  table,
  events = ['INSERT', 'UPDATE', 'DELETE'],
  onData,
}: UseRealtimeSubscriptionProps) => {
  useEffect(() => {
    let channel: RealtimeChannel;

    const setupSubscription = async () => {
      channel = supabase
        .channel('db-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
          },
          (payload) => {
            if (events.includes(payload.eventType as Event)) {
              onData(payload);
            }
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [table, events, onData]);
};