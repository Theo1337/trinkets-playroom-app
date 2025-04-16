export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.error("This browser does not support notifications.");
    return;
  }
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    console.log("Notification permission granted.");
  } else {
    console.error("Notification permission denied.");
  }
}

export async function subscribeToPushNotifications(user) {
  if (!("serviceWorker" in navigator)) {
    console.error("Service Worker is not supported in this browser.");
    return null;
  }

  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      process.env.NEXT_PUBLIC_VAPID_KEY
    ),
  });

  console.log("Subscribed to push notifications:", subscription);

  // Send the subscription to your server

  await fetch("/api/notifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription, userId: user.id }),
  });

  console.log("Subscribed to push notifications:", subscription);
  return subscription; // Return the subscription object
}

export async function unsubscribeFromPushNotifications() {
  if (!("serviceWorker" in navigator)) {
    console.error("Service Worker is not supported in this browser.");
    return false;
  }

  const registration = await navigator.serviceWorker.ready;

  // Get the current subscription
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    console.warn("No subscription found.");
    return false;
  }

  try {
    // Unsubscribe from the push service
    const unsubscribed = await subscription.unsubscribe();
    if (unsubscribed) {
      console.log("Unsubscribed from push notifications.");

      // Remove the subscription from the server
      await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });

      console.log("Subscription removed from the server.");
      return true;
    } else {
      console.error("Failed to unsubscribe from push notifications.");
      return false;
    }
  } catch (error) {
    console.error("Error unsubscribing from push notifications:", error);
    return false;
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  try {
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  } catch (error) {
    console.error("Invalid Base64 string:", base64String);
    throw error;
  }
}
