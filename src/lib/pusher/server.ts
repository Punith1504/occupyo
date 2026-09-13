import Pusher from "pusher";

// Note: Pusher throws an error if any of these are undefined when instantiated.
// We explicitly want this to fail fast if env vars are missing to avoid silent failures in production.
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID as string,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY as string,
  secret: process.env.PUSHER_SECRET as string,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
  useTLS: true,
});
