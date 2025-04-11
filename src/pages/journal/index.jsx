"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to user selection page
    router.push("/journal/users");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-red-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-700">Diário</h1>
        <p className="mt-2 text-red-600">Carregando...</p>
      </div>
    </div>
  );
}
