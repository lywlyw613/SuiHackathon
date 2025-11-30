import Pusher from 'pusher-js';

let pusherClient: Pusher | null = null;

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY;
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER || 'us2';

if (typeof window !== 'undefined' && PUSHER_KEY) {
  pusherClient = new Pusher(PUSHER_KEY, {
    cluster: PUSHER_CLUSTER,
    enabledTransports: ['ws', 'wss'],
    forceTLS: true,
    authEndpoint: undefined, // We're using public channels, no auth needed
  });
  
  // Log connection status for debugging
  pusherClient.connection.bind('connected', () => {
    console.log('Pusher connected');
  });
  
  pusherClient.connection.bind('disconnected', () => {
    console.warn('Pusher disconnected');
  });
  
  pusherClient.connection.bind('state_change', (states: any) => {
    console.log('Pusher state changed:', states.previous, '->', states.current);
  });
  
  pusherClient.connection.bind('error', (err: any) => {
    console.error('Pusher connection error:', err);
    // Don't log as error if it's just a connection issue that will retry
    if (err.error?.data?.code !== 1006) {
      console.error('Pusher error details:', err);
    }
  });
}

export { pusherClient };

