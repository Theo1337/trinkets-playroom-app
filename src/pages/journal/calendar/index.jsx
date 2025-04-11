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
import { ArrowLeft, Plus } from "lucide-react";
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

export default function CalendarPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [userId, setUserId] = useState(null);
  const [entries, setEntries] = useState([]);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [error, setError] = useState("");

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
    } else {
      setError("Senha incorreta");
    }
  };

  const handleBackToUsers = () => {
    router.push("/journal/users");
  };

  return (
    <div className="mx-auto py-8 grid place-items-center calendar-page h-screen bg-red-50">
      <Head>
        <title>Cafofo Estelar - Diário | Calendário</title>
      </Head>
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
              today: "bg-red-50 font-bold text-red-600 rounded-lg",
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

          <Button
            className="mt-6 w-full bg-red-400 hover:bg-red-400/80"
            onClick={() => {
              if (selectedDate) {
                const formattedDate = formatDateToYYYYMMDD(selectedDate);
                if (formattedDate) {
                  navigateToJournal(formattedDate);
                }
              }
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Criar Nova Entrada
          </Button>
        </CardContent>
      </Card>

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
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
              onClick={() => setPasswordDialogOpen(false)}
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
