"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, MoveLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getEntriesForUser, getEntryByDate } from "@/lib/journal-service";
import { ptBR } from "date-fns/locale";
import { isValid } from "date-fns";
import Head from "next/head";

import { OrbitProgress } from "react-loading-indicators";

export default function CalendarPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(null);
  const [userId, setUserId] = useState(null);
  const [entries, setEntries] = useState([]);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get selected user from localStorage
    const storedUserId = localStorage.getItem("selectedUserId");
    if (!storedUserId) {
      router.push("/journal/users");
      return;
    }

    const id = Number.parseInt(storedUserId);
    setUserId(id);

    // Load entries for this user
    const loadEntries = async () => {
      const userEntries = await getEntriesForUser(id);
      setEntries(userEntries);
      setTimeout(() => {
        setLoading(false);
      }, 500);
    };

    loadEntries();
  }, [router]);

  const handleDateSelect = async (date) => {
    if (!date || !userId) return;

    setSelectedDate(date);

    // Format date to YYYY-MM-DD for comparison
    const formattedDate = formatDateToYYYYMMDD(date);
    if (!formattedDate) return;

    // Check if there's an entry for this date
    const entry = await getEntryByDate(userId, formattedDate);

    if (entry) {
      setSelectedEntry(entry);

      // If password protected, show dialog
      if (entry.isPasswordProtected) {
        setPasswordDialogOpen(true);
        return;
      }
    }

    // Navigate to journal page with date
    navigateToJournal(formattedDate);
  };

  // Helper function to format date to YYYY-MM-DD without timezone issues
  const formatDateToYYYYMMDD = (date) => {
    try {
      // Verificar se a data é válida
      if (!date) return null;

      // Criar uma nova data para evitar problemas de referência
      const newDate = new Date(date);
      if (!isValid(newDate)) return null;

      const year = newDate.getFullYear();
      const month = String(newDate.getMonth() + 1).padStart(2, "0");
      const day = String(newDate.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return null;
    }
  };

  const navigateToJournal = (date) => {
    router.push(`/journal/page?date=${date}`);
  };

  const handlePasswordSubmit = () => {
    if (!selectedEntry) return;

    if (password === selectedEntry.password) {
      setError("");
      setPasswordDialogOpen(false);
      navigateToJournal(selectedEntry.date);
      setSelectedDate(null);
    } else {
      setError("Senha incorreta");
    }
  };

  const handleBackToUsers = () => {
    router.push("/journal/users");
  };

  return (
    <div className="mx-auto px-4 py-8 h-screen flex items-center justify-center flex-col gap-4 calendar-page  bg-red-50">
      <div
        onClick={() => {
          window.location.href = "/";
        }}
        className="flex items-center justify-center absolute top-0 left-0 gap-2 p-4 group cursor-pointer"
      >
        <MoveLeft className="text-neutral-500 text-2xl" />
        <div className="text-xs mt-0.5 text-neutral-500 uppercase group-hover:underline ">
          início
        </div>
      </div>
      <Head>
        <title>Cafofo Estelar - Diário | Calendário</title>
      </Head>
      <div className="flex items-center justify-center flex-col gap-2 ">
        <div className="font-logo text-4xl text-neutral-700 ">Diário</div>
        <div className="text-xs text-neutral-500 uppercase">
          {"Diário para anotar seus sentimentos!"}
        </div>
      </div>
      <Card className="w-full border-red-200 max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={handleBackToUsers}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-3xl font-bold flex-1">
              Selecionar Data
            </CardTitle>
          </div>
          <CardDescription>
            Escolha uma data para ver ou criar uma entrada no diário
          </CardDescription>
        </CardHeader>
        {loading ? (
          <CardContent className="flex flex-col items-center">
            <div className="flex flex-col items-center justify-center">
              <OrbitProgress color="#f87171" />
              <div className="text-center text-red-400">
                Carregando entradas...
              </div>
            </div>
          </CardContent>
        ) : (
          <CardContent className="flex flex-col items-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border border-red-200"
              locale={ptBR}
              modifiersClassNames={{
                selected:
                  "bg-red-50 font-bold text-red-600 hover:bg-red-200 rounded-lg",
                hasEntry: "bg-red-100",
                protected: "border-2 border-red-400",
                today: "bg-white",
              }}
              modifiers={{
                hasEntry: (date) => {
                  if (!date) return false;
                  try {
                    const formattedDate = formatDateToYYYYMMDD(date);
                    return (
                      formattedDate &&
                      entries.some((entry) => entry.date === formattedDate)
                    );
                  } catch (error) {
                    return false;
                  }
                },
                protected: (date) => {
                  if (!date) return false;
                  try {
                    const formattedDate = formatDateToYYYYMMDD(date);
                    return (
                      formattedDate &&
                      entries.some(
                        (entry) =>
                          entry.date === formattedDate &&
                          entry.isPasswordProtected
                      )
                    );
                  } catch (error) {
                    return false;
                  }
                },
              }}
            />

            <div className="flex items-center justify-between w-full mt-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 rounded-full"></div>
                <span className="text-sm">Tem Entrada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-red-400 rounded-full"></div>
                <span className="text-sm">Protegido por Senha</span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <Dialog
        open={passwordDialogOpen}
        onOpenChange={() => {
          setPasswordDialogOpen(false);
          setSelectedDate(null);
        }}
      >
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Entrada Protegida por Senha</DialogTitle>
            <DialogDescription>
              Esta entrada do diário está protegida por senha. Por favor, digite
              a senha para continuar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handlePasswordSubmit();
                }}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPasswordDialogOpen(false);
                setSelectedDate(null);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handlePasswordSubmit}>Continuar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
