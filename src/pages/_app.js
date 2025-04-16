import "../styles/globals.css";
import "@/components/layout/layout.css";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import LoadingAnimation from "@/components/LoadingAnimation";

export default function App({ Component, pageProps }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => {
      setLoading(false);

      // Dynamically update the theme color
      const themeColors = {
        "/": "#f3eae3", // Home page
        "/list": "#cbd5e1", // Movie list page
        "/journal": "#fef2f2", // Journal page
        "/timeline": "#f0fdf4", // Timeline page
        "/counter": "#f3e8ff", // Counter page
      };

      const themeColor = themeColors[router.pathname] || "#ffffff"; // Default color
      const metaThemeColor = document.querySelector("meta[name='theme-color']");
      if (metaThemeColor) {
        metaThemeColor.setAttribute("content", themeColor);
      }
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    // Set the initial theme color
    handleComplete();

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log(
            "Service Worker registered with scope:",
            registration.scope
          );
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  return (
    <>
      {loading && <LoadingAnimation />}
      <Component {...pageProps} />
    </>
  );
}
