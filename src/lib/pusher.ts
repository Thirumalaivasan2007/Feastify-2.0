import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

// Setup Server-Side Pusher
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID || 'mock_app_id',
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY || 'mock_key',
  secret: process.env.PUSHER_SECRET || 'mock_secret',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2',
  useTLS: true,
});

// Setup Client-Side Pusher
// We only initialize this on the client side
export const pusherClient = 
  typeof window !== 'undefined' 
    ? new PusherClient(process.env.NEXT_PUBLIC_PUSHER_APP_KEY || 'mock_key', {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2',
      })
    : null;
