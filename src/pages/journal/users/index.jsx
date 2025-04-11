"use client";
import { useState, useEffect } from "react";
import { api } from "@/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { OrbitProgress } from "react-loading-indicators";
import Head from "next/head";

import { MoveLeft } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch users from server
    api.get("/users").then((res) => {
      setUsers(res.data);
    });
  }, []);

  const router = useRouter();

  const selectUser = (userId) => {
    // Store selected user in localStorage
    localStorage.setItem("selectedUserId", userId.toString());
    router.push("/journal/calendar");
  };

  return (
    <div className="px-8 grid place-items-center bg-red-50 min-h-screen">
      <div
        onClick={() => {
          window.location.href = "/";
        }}
        className="flex items-center justify-center absolute top-0 left-0 gap-2 p-4 group cursor-pointer"
      >
        <MoveLeft className="text-neutral-500 text-2xl" />
        <div className="text-xs mt-0.5 text-neutral-500 uppercase group-hover:underline ">
          voltar
        </div>
      </div>
      <Head>
        <title>Cafofo Estelar - Diário | Usuários</title>
      </Head>
      <div className="flex items-center justify-center flex-col gap-2">
        <div className="font-logo text-4xl text-neutral-700 ">Diário</div>
        <div className="text-xs text-neutral-500 uppercase">
          {"Diário para anotar seus sentimentos!"}
        </div>
      </div>
      <Card className="w-full border-red-200 max-w-md -mt-[125%] md:-mt-[28%]">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            Selecionar Usuário
          </CardTitle>
          <CardDescription>
            Escolha um usuário para ver ou criar entradas no diário
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center">
              <OrbitProgress color="#f87171" />
              <div className="text-center text-red-400">
                Carregando usuários...
              </div>
            </div>
          ) : (
            users.map((user) => (
              <Button
                key={user.id}
                variant="outline"
                className="flex items-center justify-start gap-4 h-20 p-4 border-red-200 hover:bg-red-50"
                onClick={() => selectUser(user.id)}
              >
                <Avatar className="h-12 w-12 bg-red-100">
                  <AvatarImage
                    src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`}
                    alt={user.name}
                  />
                  <AvatarFallback className="bg-red-200 text-red-700">
                    {/* get only the first two letters */}
                    {user.name.slice(0, 5).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-lg font-medium">{user.name}</span>
              </Button>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
