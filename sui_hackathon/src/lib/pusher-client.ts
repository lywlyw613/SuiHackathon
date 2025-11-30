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
    // Only log non-critical errors
    // Code 1006 is a normal connection close, will auto-retry
    // Code 1000 is a normal closure
    const errorCode = err?.error?.data?.code || err?.code;
    if (errorCode !== 1006 && errorCode !== 1000) {
      console.warn('Pusher connection error (non-critical):', {
        type: err?.type,
        code: errorCode,
        message: err?.error?.data?.message || err?.message,
      });
    }
    // Don't log as error - Pusher will auto-retry, and we have polling as fallback
  });
}

export { pusherClient };

