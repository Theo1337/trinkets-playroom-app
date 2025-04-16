export async function requestNotificationPermission(e) {
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
