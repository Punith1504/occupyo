import Pusher from "pusher";

// Note: Pusher throws an error if any of these are undefined when instantiated.
// For local development without keys, we provide dummy fallbacks just to allow build to pass.
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID || "app_id",
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || "key",
  secret: process.env.PUSHER_SECRET || "secret",
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2",
  useTLS: true,
});
