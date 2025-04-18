import webPush from "web-push";
import { prisma } from "@/lib/database"; // Adjust the path to your Prisma client

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

webPush.setVapidDetails(
  "mailto:your-email@example.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { subscription, userId, title, body, url, currentUserEndpoint } =
      req.body;

    if (subscription) {
      try {
        // Check if the subscription already exists
        const existingSubscription = await prisma.subscription.findUnique({
          where: { endpoint: subscription.endpoint },
        });

        if (!existingSubscription) {
          // Save the subscription to the database
          await prisma.subscription.create({
            data: {
              endpoint: subscription.endpoint,
              keys: subscription.keys,
              userId: userId,
            },
          });
        }

        return res.status(200).json({ message: "Subscription added." });
      } catch (error) {
        console.error("Error saving subscription:", error);
        return res.status(500).json({ error: "Failed to save subscription." });
      }
    }

    // Send notifications to all subscriptions except the current user
    try {
      const subscriptions = await prisma.subscription.findMany();
      const payload = JSON.stringify({ title, body, url });

      await Promise.all(
        subscriptions
          .filter(
            (sub) =>
              sub.endpoint !== currentUserEndpoint && sub.userId !== userId
          ) // Exclude the current user's subscription
          .map((sub) =>
            webPush
              .sendNotification(
                {
                  endpoint: sub.endpoint,
                  keys: sub.keys,
                },
                payload
              )
              .catch((err) => {
                console.error("Failed to send notification:", err);
              })
          )
      );

      return res.status(200).json({ message: "Notifications sent." });
    } catch (error) {
      console.error("Error sending notifications:", error);
      return res.status(500).json({ error: "Failed to send notifications." });
    }
  } else if (req.method === "DELETE") {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res
        .status(400)
        .json({ error: "Endpoint is required to unsubscribe." });
    }

    try {
      // Remove the subscription from the database
      await prisma.subscription.delete({
        where: { endpoint },
      });

      return res.status(200).json({ message: "Unsubscribed successfully." });
    } catch (error) {
      console.error("Error unsubscribing:", error);
      return res.status(500).json({ error: "Failed to unsubscribe." });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}

export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.error("This browser does not support notifications.");
    return "unsupported";
  }

  console.log("Requesting notification permission...");
  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    console.log("Notification permission granted.");
  } else if (permission === "denied") {
    console.error("Notification permission denied.");
  } else {
    console.warn("Notification permission dismissed or not resolved.");
  }

  return permission;
}
