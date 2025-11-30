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
    console.log('[Pusher] ✅ Connected successfully');
  });
  
  pusherClient.connection.bind('disconnected', () => {
    console.warn('[Pusher] ⚠️ Disconnected');
  });
  
  pusherClient.connection.bind('state_change', (states: any) => {
    console.log(`[Pusher] State: ${states.previous} → ${states.current}`);
  });
  
  pusherClient.connection.bind('error', (err: any) => {
    // Only log non-critical errors
    // Code 1006 is a normal connection close, will auto-retry
    // Code 1000 is a normal closure
    const errorCode = err?.error?.data?.code || err?.code;
    const errorType = err?.type || 'Unknown';
    const errorMessage = err?.error?.data?.message || err?.message || 'No error message';
    
    // Filter out common non-critical errors
    if (errorCode !== 1006 && errorCode !== 1000 && errorCode !== undefined) {
      console.warn('[Pusher] ⚠️ Connection error:', {
        type: errorType,
        code: errorCode,
        message: errorMessage,
      });
    } else if (errorCode === undefined && errorType === 'PusherError') {
      // This might be a client event error - check if it's about client events
      // Don't log as error if it's just about client events not being enabled
      console.warn('[Pusher] ⚠️ Client event may not be enabled in Pusher Dashboard');
    }
  });
  
  // Log when connection is established
  pusherClient.connection.bind('connected', () => {
    console.log('[Pusher] Ready for real-time updates');
  });
}

export { pusherClient };

