"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AArrowDown,
  AArrowUp,
  Save,
  Lock,
  ArrowLeft,
  Trash2,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  saveJournalEntry,
  getEntryByDate,
  deleteEntry,
} from "@/lib/journal-service";
import styles from "./journal.module.css";
import Head from "next/head";
import { GoBackButton, Header } from "@/components";
import { Textarea } from "@/components/ui/textarea";

export default function JournalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");

  const editorRef = useRef(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [userId, setUserId] = useState(null);
  const [date, setDate] = useState("");
  const [entry, setEntry] = useState(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Estado para controlar a exibição do toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    // Get selected user from localStorage
    const storedUserId = localStorage.getItem("selectedUserId");
    if (!storedUserId) {
      router.push("/journal/users");
      return;
    }

    const id = storedUserId;
    setUserId(id);

    // Set date from URL parameter or use today's date
    const entryDate = dateParam || formatDateToYYYYMMDD(new Date());
    setDate(entryDate);

    // Load entry if it exists
    const loadEntry = async () => {
      if (!entryDate) return;

      const existingEntry = await getEntryByDate(id, entryDate);
      if (existingEntry) {
        setEntry(existingEntry);
        setTitle(existingEntry.title || "");
        setComment(existingEntry.comment || "");
        if (editorRef.current) {
          editorRef.current.innerHTML = existingEntry.content;
          setContent(existingEntry.content);
        }
      }
    };

    loadEntry();
  }, [router, dateParam]);

  // Efeito para esconder o toast após 3 segundos
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Função para exibir o toast
  const displayToast = (title, description) => {
    setToastMessage({ title, description });
    setShowToast(true);
  };

  // Modifique a função formatDateToYYYYMMDD para usar isValid do date-fns
  const formatDateToYYYYMMDD = (date) => {
    try {
      // Verificar se a data é válida usando isValid do date-fns
      if (!date || !isValid(date)) {
        return null;
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return null;
    }
  };

  // Modifique a função formatDate para usar isValid do date-fns
  const formatDate = (dateString) => {
    if (!dateString) return "Nova Entrada";

    try {
      // Parse the date string (YYYY-MM-DD) to create a Date object
      const [year, month, day] = dateString.split("-").map(Number);
      const date = new Date(year, month - 1, day);

      // Verificar se a data é válida
      if (!isValid(date)) {
        return "Data inválida";
      }

      return format(date, "d 'de' MMMM, yyyy", { locale: ptBR });
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "Data inválida";
    }
  };

  const saveContent = async () => {
    if (!userId || !date || !editorRef.current) return;

    const currentContent = editorRef.current.innerHTML;

    // Check if the content or title has changed
    if (
      currentContent.trim() === entry?.content?.trim() &&
      title.trim() === entry?.title?.trim() &&
      comment.trim() === entry?.comment?.trim()
    ) {
      console.log("No changes detected. Save operation skipped.");
      return;
    }

    setIsSaving(true);
    setContent(currentContent);

    try {
      // Save to database
      const updatedEntry = await saveJournalEntry({
        id: entry?.id || null, // Use existing ID or null for a new entry
        userId,
        date,
        title,
        content: currentContent,
        isPasswordProtected: entry?.isPasswordProtected || false,
        password: entry?.password || "",
        currentUserId: JSON.parse(localStorage.getItem("user")).id,
        comment: comment,
      });

      if (updatedEntry && updatedEntry.id) {
        // Update the entry state with the saved entry
        setEntry(updatedEntry);
      } else {
        console.error(
          "Failed to save entry: No ID returned from saveJournalEntry."
        );
      }

      setIsSaving(false);

      // Display success toast
      displayToast("Diário salvo com sucesso!", "Suas anotações foram salvas.");
    } catch (error) {
      console.error("Error saving entry:", error);
      setIsSaving(false);

      // Display error toast
      displayToast(
        "Erro ao salvar diário",
        "Não foi possível salvar suas anotações."
      );
    }
  };

  const handleLock = () => {
    setPasswordDialogOpen(true);
  };

  const handlePasswordSubmit = async () => {
    if (!userId || !date || !editorRef.current) return;

    const currentContent = editorRef.current.innerHTML;

    // Save to database with password protection
    const updatedEntry = await saveJournalEntry({
      id: entry?.id,
      userId,
      date,
      title,
      content: currentContent,
      isPasswordProtected: true,
      password,
    });

    setEntry(updatedEntry);
    setPasswordDialogOpen(false);

    // Exibir toast de sucesso
    displayToast(
      "Entrada protegida com senha",
      "Esta entrada agora está protegida com senha."
    );
  };

  const handleDelete = async () => {
    if (!userId || !date) return;
    await deleteEntry({
      id: entry.id,
    });
    setDeleteDialogOpen(false);

    // Exibir toast de exclusão
    displayToast("Entrada excluída", "A entrada foi excluída com sucesso.");

    router.push("/journal/calendar");
  };

  const formatText = (command, value = "") => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleInput = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="bg-red-50 min-h-screen">
      <GoBackButton />
      <Head>
        <title>Cafofo Estelar - Diário</title>
        <meta name="theme-color" content="#fef2f2 " />
        <meta name="theme_color" content="#fef2f2 " />
      </Head>
      <div className="flex items-center justify-center flex-col gap-2 pt-12">
        <Header
          title="Diário"
          description="Diário para anotar seus sentimentos!"
        />
      </div>
      <div className={styles.journalPage}>
        {/* Toast personalizado */}
        {showToast && (
          <div
            className={
              styles.customToast +
              " top-4 fixed w-[380px] animation-[fadeInSlideDown_0.3s_ease-out]"
            }
          >
            <div className={styles.customToastContent}>
              <CheckCircle2 className={styles.toastIcon} />
              <div>
                <h3 className={styles.toastTitle}>{toastMessage.title}</h3>
                <p className={styles.toastDescription}>
                  {toastMessage.description}
                </p>
              </div>
            </div>
          </div>
        )}
        <div className={styles.header}>
          <button
            className={styles.backButton}
            onClick={() => router.push("/journal/calendar")}
          >
            <ArrowLeft size={16} />
          </button>
          <div className={styles.titleContainer}>
            <input
              type="text"
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.titleInput}
            />
            <p className={styles.dateText}>
              {date ? formatDate(date) : "Nova Entrada"}
            </p>
          </div>
        </div>
        <div className={styles.editorContainer}>
          <div
            className={
              styles.editorToolbar +
              " flex md:justify-start justify-center items-center gap-2"
            }
          >
            <button
              className={styles.toolbarButton}
              onClick={() => formatText("bold")}
            >
              <Bold size={16} />
            </button>
            <button
              className={styles.toolbarButton}
              onClick={() => formatText("italic")}
            >
              <Italic size={16} />
            </button>
            <button
              className={styles.toolbarButton}
              onClick={() => formatText("underline")}
            >
              <Underline size={16} />
            </button>
            <div className={styles.separator}></div>
            <button
              className={styles.toolbarButton}
              onClick={() => formatText("fontSize", "7")}
            >
              <AArrowUp size={16} />
            </button>
            <button
              className={styles.toolbarButton}
              onClick={() => formatText("fontSize", "3")}
            >
              <AArrowDown size={16} />
            </button>
            <div className={styles.separator}></div>
            <button
              className={styles.toolbarButton}
              onClick={() => formatText("justifyLeft")}
            >
              <AlignLeft size={16} />
            </button>
            <button
              className={styles.toolbarButton}
              onClick={() => formatText("justifyCenter")}
            >
              <AlignCenter size={16} />
            </button>
            <button
              className={styles.toolbarButton}
              onClick={() => formatText("justifyRight")}
            >
              <AlignRight size={16} />
            </button>
            <div
              className={
                styles.toolbarActions +
                " flex gap-2 justify-center my-2 items-center md:my-0 w-full md:w-auto"
              }
            >
              <button
                className={`${styles.actionButton} ${styles.deleteButton}`}
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 size={16} />
                Excluir
              </button>
              <button className={styles.actionButton} onClick={handleLock}>
                <Lock size={16} />
                {entry?.isPasswordProtected ? "Alterar Senha" : "Bloquear"}
              </button>
              <button
                className={`${styles.actionButton} ${styles.saveButton}`}
                onClick={saveContent}
                disabled={isSaving}
              >
                <Save size={16} />
                {isSaving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
          <div
            ref={editorRef}
            className={styles.editorContent}
            contentEditable
            onInput={handleInput}
            suppressContentEditableWarning={true}
            data-placeholder="Escreva aqui..."
          />
        </div>
        <div className="text-lg font-bold text-red-800">Comentário</div>
        <div className="flex flex-col items-end justify-center gap-2">
          <Textarea
            type="text"
            placeholder="Adcione o seu comentário aqui..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            homeInput
            className={
              "w-full rounded-lg p-2 focus-visible:ring-red-900 focus-visible:ring-offset-1 focus-visible:ring-2 outline-none bg-white resize-none mt-1 min-h-44"
            }
          />
          <button
            className={`${styles.actionButton} ${styles.saveButton} mx-0.5`}
            onClick={saveContent}
            disabled={isSaving}
          >
            <Save size={16} />
            {isSaving ? "Salvando..." : "Salvar comentário"}
          </button>
        </div>
        {/* Mantendo os componentes de diálogo do shadcn/ui */}
        <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Proteger Entrada com Senha</DialogTitle>
              <DialogDescription>
                Defina uma senha para proteger esta entrada do diário. Você
                precisará desta senha para visualizar a entrada no futuro.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="lock-password">Senha</Label>
                <Input
                  id="lock-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setPasswordDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handlePasswordSubmit}>
                {entry?.isPasswordProtected
                  ? "Atualizar Senha"
                  : "Definir Senha"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente
                esta entrada do diário.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
