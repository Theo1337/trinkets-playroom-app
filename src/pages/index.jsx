import { prisma } from "@/lib/database";
import { api } from "@/utils";

import { DialogTrigger } from "@/components/ui/dialog";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  CheckCircle2,
  Clock,
  Film,
  BookText,
  Sparkles,
  User,
  Edit,
  Plus,
  Construction,
  Bell,
  BellOff,
  Trash,
  Flame,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useMediaQuery } from "@/hooks/use-mobile";
import { OrbitProgress } from "react-loading-indicators";

import {
  requestNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from "@/utils/notifications";
import { format, isSameDay, subDays, addHours } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import Head from "next/head";
import { Header } from "@/components";

export const getServerSideProps = async () => {
  const quotes = await prisma.quotes.findMany({
    orderBy: [
      {
        date: "desc",
      },
    ],
  });

  const serialized = JSON.parse(JSON.stringify(quotes));

  return {
    props: {
      rawQuotes: serialized,
    },
  };
};

export default function Home({ rawQuotes }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] =
    useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [quotesData, setQuotesData] = useState(rawQuotes);
  const [isAddQuoteOpen, setIsAddQuoteOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);
  const [newQuoteTitle, setNewQuoteTitle] = useState("");
  const [newQuoteContent, setNewQuoteContent] = useState("");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [streak, setStreak] = useState(0);

  useEffect(() => {
    calculateStreak();
  }, [quotesData]);

  const adjustToBrazilianTime = (date) => addHours(new Date(date), -3);

  const calculateStreak = () => {
    // Filter quotes to include only those from the two specific users
    const filteredQuotes = quotesData.filter(
      (quote) =>
        quote.authorId === "277539638397370369" ||
        quote.authorId === "1250558369937363107"
    );

    // Sort quotes by date in descending order
    const sortedQuotes = [...filteredQuotes].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    let currentStreak = 0;
    let currentDate = adjustToBrazilianTime(new Date()); // Adjust to Brazilian time

    while (true) {
      // Check if both users have quotes for the current date
      const hasUser1Quote = sortedQuotes.some(
        (quote) =>
          quote.authorId === "277539638397370369" &&
          isSameDay(new Date(quote.date), currentDate)
      );

      const hasUser2Quote = sortedQuotes.some(
        (quote) =>
          quote.authorId === "1250558369937363107" &&
          isSameDay(new Date(quote.date), currentDate)
      );

      if (hasUser1Quote && hasUser2Quote) {
        currentStreak++;
        currentDate = subDays(currentDate, 1); // Move to the previous day
      } else {
        break; // Stop the streak if one or both users are missing
      }
    }

    setStreak(currentStreak);
  };
  useEffect(() => {
    const sub = localStorage.getItem("subscription");
    if (sub) {
      setNotificationsEnabled(true);
    }
  }, []);

  const [configs, setConfigs] = useState({
    user: {
      name: "",
      avatar: "",
      id: "",
      pronoum: "o",
    },
    users: [],
  });

  // Get users function
  const getUsers = async () => {
    const users = await api.get("/users");

    setConfigs((prevConfigs) => ({
      ...prevConfigs,
      users: users.data,
    }));

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const savedUser = users.data.find((u) => u.id === user.id);

    if (user.avatar !== savedUser.avatar || user.name !== savedUser.name) {
      localStorage.setItem(
        "user",
        JSON.stringify(savedUser ? savedUser : user)
      );
    }

    return users;
  };

  // get users function
  useEffect(() => {
    const users = async () => {
      await getUsers();
    };
    if (configs.users.length === 0) {
      users();
    }
  }, []);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setConfigs((prevConfigs) => ({
        ...prevConfigs,
        user: JSON.parse(user),
      }));
      setSelectedUser(JSON.parse(user));
    }
  }, []);

  const handleOpenQuoteDialog = (quote = null) => {
    if (quote) {
      // Edit mode
      setNewQuoteTitle(quote.author);
      setNewQuoteContent(quote.quote);
      setEditingQuote(quote);
    } else {
      // Add mode
      setNewQuoteTitle("");
      setNewQuoteContent("");
      setEditingQuote(null);
    }
    setIsAddQuoteOpen(true);
  };

  const handleSaveQuote = () => {
    if (editingQuote) {
      // Update existing quote
      api
        .put(`/quotes/${editingQuote.id}`, {
          id: editingQuote.id,
          quote: newQuoteContent,
          author: newQuoteTitle,
          authorId: selectedUser.id,
          date: new Date(),
        })
        .then((res) => {
          setQuotesData(
            quotesData.map((q) => (q.id === editingQuote.id ? res.data : q))
          );
          api.post("/notifications", {
            body: `${
              JSON.parse(localStorage.getItem("user"))?.name
            } editou sua citação`,
            url: "/",
            userId: selectedUser.id,
          });
        });
    } else {
      // Add new quote
      api
        .post("/quotes", {
          quote: newQuoteContent,
          author: newQuoteTitle,
          authorId: selectedUser.id,
          date: new Date(),
        })
        .then((res) => {
          setQuotesData([...quotesData, res.data]);
          api.post("/notifications", {
            body: `Nova citação adicionada por ${
              JSON.parse(localStorage.getItem("user")).name
            }`,
            url: "/",
            userId: selectedUser.id,
          });
        });
    }

    // Reset form and close dialog
    setNewQuoteTitle("");
    setNewQuoteContent("");
    setEditingQuote(null);
    setIsAddQuoteOpen(false);
  };

  const toggleNotifications = async () => {
    setNotificationsEnabled(!notificationsEnabled);
    setIsNotificationDialogOpen(false);
    if (!notificationsEnabled == true) {
      await requestNotificationPermission();
      const subscription = await subscribeToPushNotifications({
        id: configs.user.id,
      });
      localStorage.setItem("subscription", JSON.stringify(subscription));
    } else if (!notificationsEnabled == false) {
      await unsubscribeFromPushNotifications();
      localStorage.removeItem("subscription");
    }
  };

  // Find if current user has a quote
  const currentUserQuote = selectedUser
    ? quotesData
        .filter((e) => isSameDay(new Date(e.date), new Date()))
        .find((quote) => quote.authorId === selectedUser.id)
    : null;

  return (
    <div
      className="min-h-screen relative cafofo-page"
      style={{ backgroundColor: "#f3eae3" }}
    >
      <Head>
        <title>Cafofo Estelar</title>
        <meta name="theme_color" content="#f3eae3" />
        <meta name="theme-color" content="#f3eae3" />
      </Head>
      <style jsx global>{`
        .cafofo-page .hover-scale:hover {
          transform: scale(1.03);
        }
      `}</style>

      <div
        className="z-20 py-2 px-4 shadow-sm"
        style={{ backgroundColor: "#f3eae3" }}
      >
        <div className="container mx-auto flex justify-between items-center">
          {configs.user.id == "" || configs.user.id == null ? (
            <div className="p-2 rounded-lg px-4 flex items-center gap-2 bg-stone-100 border-stone-300 text-stone-800 cursor-default shadow-md transition-all">
              <User className="w-4 h-4 hidden md:block" />
              <div className=" hidden md:block">
                Selecione um usuário para ativar as notificações
              </div>
              <div className="flex items-center justif-center gap-2 uppercase md:hidden">
                <BellOff className="h-4 w-4" />
                Sem usuário
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 ${
                notificationsEnabled
                  ? "bg-green-100 border-green-300 text-green-800 hover:bg-green-200"
                  : "bg-stone-100 border-stone-300 text-stone-800 hover:bg-stone-200"
              } shadow-sm`}
              onClick={() => setIsNotificationDialogOpen(true)}
            >
              {notificationsEnabled ? (
                <>
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Notificações Ativas</span>
                </>
              ) : (
                <>
                  <BellOff className="h-4 w-4" />
                  <span className="hidden sm:inline">Notificações</span>
                </>
              )}
            </Button>
          )}

          <UserSelector
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            users={configs.users}
            setConfigs={(e) => {
              setConfigs({
                ...configs,
                user: e,
              });
            }}
          />
        </div>
      </div>

      <header className="container mx-auto py-6 px-4">
        <Header
          title="Cafofo Estelar"
          description={`Seja bem-vind${selectedUser?.pronoum} ao cantinho do Theo e da Ana!`}
          className="mb-8"
        />
        <QuotesSection
          selectedUser={selectedUser}
          quotesData={quotesData}
          onQuoteAction={handleOpenQuoteDialog}
          currentUserQuote={currentUserQuote}
          users={configs.users}
          streak={streak}
        />
      </header>

      <main className="container mx-auto py-8 px-4">
        <h2 className="text-2xl font-semibold text-stone-800 mb-6 flex items-center">
          <span className="mr-2">Seu Hub</span>
          <div className="h-px flex-grow bg-stone-300 ml-4"></div>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <LinkCard
            href="/counter"
            icon={<PlusMinusIcon className="h-6 w-6 text-stone-700" />}
            title="Contador"
            requiresUser={true}
            selectedUser={selectedUser}
            description="Lista de contadores esquisitos"
          />

          <LinkCard
            href="/list"
            icon={<Film className="h-6 w-6 text-stone-700" />}
            title="Lista"
            description="Filmes e séries para nós assistirmos juntinhos"
            requiresUser={true}
            selectedUser={selectedUser}
          />

          <LinkCard
            href="/timeline"
            icon={<Clock className="h-6 w-6 text-stone-700" />}
            title="Linha do Tempo"
            requiresUser={true}
            selectedUser={selectedUser}
            description='Coisas importantes que aconteceram (e os "favoritos")'
          />

          <LinkCard
            href="/journal"
            icon={<BookText className="h-6 w-6 text-stone-700" />}
            title="Diários"
            description="Diário em conjunto para anotar seus sentimentos"
            requiresUser={true}
            selectedUser={selectedUser}
          />

          <LinkCard
            href="/checklist"
            icon={<CheckCircle2 className="h-6 w-6 text-stone-700" />}
            title="Checklist"
            description="Acompanhe suas tarefas"
            maintenance={true}
          />

          <LinkCard
            href="/dreams"
            icon={<Sparkles className="h-6 w-6 text-stone-700" />}
            title="Sonhos"
            description="Registre seus sonhos e aspirações"
            maintenance={true}
          />
        </div>
      </main>

      <footer
        className="py-6 mt-8 border-t border-stone-200"
        style={{ backgroundColor: "#ebe0d6" }}
      >
        <div className="container mx-auto px-4 text-center text-stone-700 text-sm flex items-center justify-center gap-2">
          © 2025 Cafofo Estelar. Todos os direitos reservados.
          <Link href="/surprise">
            <Heart className="h-4 w-4 hover:text-red-500 hover:fill-red-500 hover:scale-125 transition cursor-pointer" />
          </Link>
        </div>
      </footer>

      {/* Add/Edit Quote Dialog/Drawer */}
      {isMobile ? (
        <Drawer open={isAddQuoteOpen} onOpenChange={setIsAddQuoteOpen}>
          <DrawerContent className="bg-[#ebe0d6]">
            <DrawerHeader>
              <DrawerTitle>
                {editingQuote ? "Editar Citação" : "Adicionar Nova Citação"}
              </DrawerTitle>
              <DrawerDescription>
                Compartilhe seus pensamentos com a comunidade.
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quote-title-mobile">Nome</Label>
                  <Input
                    id="quote-title-mobile"
                    autoComplete="off"
                    placeholder="Nome personalizado para a citação..."
                    value={newQuoteTitle}
                    homeInput
                    onChange={(e) => setNewQuoteTitle(() => e.target.value)}
                    className="bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quote-content-mobile">Sua Citação</Label>
                  <Textarea
                    id="quote-content-mobile"
                    autoComplete="off"
                    placeholder="Digite sua citação aqui..."
                    value={newQuoteContent}
                    homeInput
                    onChange={(e) => setNewQuoteContent(() => e.target.value)}
                    className="bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-600"
                  />
                </div>
              </div>
            </div>
            <DrawerFooter>
              {editingQuote && (
                <Button
                  variant="outline"
                  className="text-red-500 border-red-500 hover:text-red-600 hover:bg-white/15"
                  onClick={() => {
                    setIsAddQuoteOpen(false);
                    setEditingQuote(null);
                    setNewQuoteTitle("");
                    setNewQuoteContent("");

                    api.delete(`/quotes/${editingQuote.id}`).then((res) => {
                      setQuotesData(
                        quotesData.filter((each) => each.id !== res.data.id)
                      );
                    });
                  }}
                >
                  <Trash />
                  Excluir
                </Button>
              )}
              <Button
                onClick={handleSaveQuote}
                className="bg-stone-600 hover:bg-stone-700 text-stone-50"
              >
                {editingQuote ? "Atualizar Citação" : "Publicar Citação"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAddQuoteOpen(false)}
              >
                Cancelar
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isAddQuoteOpen} onOpenChange={setIsAddQuoteOpen}>
          <DialogContent className="sm:max-w-md bg-[#ebe0d6]">
            <DialogHeader>
              <DialogTitle>
                {editingQuote ? "Editar Citação" : "Adicionar Nova Citação"}
              </DialogTitle>
              <DialogDescription>
                Compartilhe seus pensamentos com a comunidade.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 ">
              <div className="space-y-2">
                <Label htmlFor="quote-title">Nome</Label>
                <Input
                  id="quote-title"
                  autoComplete="off"
                  placeholder="Nome personalizado para a citação..."
                  value={newQuoteTitle}
                  homeInput
                  onChange={(e) => setNewQuoteTitle(() => e.target.value)}
                  className="bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quote-content">Sua Citação</Label>
                <Textarea
                  id="quote-content"
                  autoComplete="off"
                  placeholder="Digite sua citação aqui..."
                  value={newQuoteContent}
                  homeInput
                  onChange={(e) => setNewQuoteContent(() => e.target.value)}
                  className="min-h-[120px] resize-none bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-600"
                />
              </div>
            </div>
            <DialogFooter>
              {editingQuote && (
                <Button
                  variant="outline"
                  className="text-red-500 border-red-500 hover:text-red-600 hover:bg-white/15"
                  onClick={() => {
                    setIsAddQuoteOpen(false);
                    setEditingQuote(null);
                    setNewQuoteTitle("");
                    setNewQuoteContent("");

                    api.delete(`/quotes/${editingQuote.id}`).then((res) => {
                      setQuotesData(
                        quotesData.filter((each) => each.id !== res.data.id)
                      );
                    });
                  }}
                >
                  <Trash />
                  Excluir
                </Button>
              )}
              <Button
                onClick={handleSaveQuote}
                className="bg-stone-600 hover:bg-stone-700 text-stone-50"
              >
                {editingQuote ? "Atualizar Citação" : "Publicar Citação"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Notifications Dialog */}
      <Dialog
        open={isNotificationDialogOpen}
        onOpenChange={setIsNotificationDialogOpen}
      >
        <DialogContent
          className="sm:max-w-md"
          style={{ backgroundColor: "#ebe0d6" }}
        >
          <DialogHeader>
            <DialogTitle>Notificações</DialogTitle>
            <DialogDescription>
              {notificationsEnabled
                ? "As notificações estão ativadas. Deseja desativá-las?"
                : "Ativar notificações para receber atualizações."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-between py-4 gap-2">
            <div className="space-y-0.5">
              <h4 className="text-base font-medium text-stone-900">
                {notificationsEnabled
                  ? "Notificações Ativas"
                  : "Notificações Desativadas"}
              </h4>
              <p className="text-sm text-stone-500">
                {notificationsEnabled
                  ? "Você receberá atualizações sobre novas citações e eventos."
                  : "Ative para receber atualizações sobre novas citações e eventos."}
              </p>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={toggleNotifications}
              className={`data-[state=checked]:bg-stone-600`}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Custom plus/minus icon component
function PlusMinusIcon({ className }) {
  return (
    <div className={className}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="8" y1="12" x2="16" y2="12" />
        <line x1="12" y1="8" x2="12" y2="16" />
      </svg>
    </div>
  );
}

// Link Card Component
function LinkCard({
  href,
  icon,
  title,
  description,
  maintenance = false,
  requiresUser = false,
  selectedUser = null,
}) {
  const isDisabled = maintenance || (requiresUser && !selectedUser);
  const disabledMessage = maintenance
    ? `${title} em Manutenção`
    : requiresUser && !selectedUser
    ? "Selecione um usuário para acessar"
    : "";

  return (
    <Link
      href={isDisabled ? "#" : href}
      className={`block transition-all duration-300 ${
        !isDisabled && "hover-scale hover:shadow-lg"
      }`}
      aria-disabled={isDisabled}
    >
      <Card
        className={`h-full border-stone-200 shadow-md ${
          isDisabled ? "relative overflow-hidden" : "hover:border-stone-300"
        }`}
        style={{ backgroundColor: "#ebe0d6" }}
      >
        {isDisabled && (
          <div className="absolute inset-0 bg-stone-50/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="bg-stone-100 p-4 rounded-lg border border-stone-300 shadow-sm text-center max-w-[80%]">
              <div className="flex items-center justify-center gap-2 text-stone-800 mb-2">
                {maintenance ? (
                  <Construction className="h-5 w-5 text-stone-600" />
                ) : (
                  <User className="h-5 w-5 text-stone-600" />
                )}
                <div className="flex items-center gap-1">
                  <span className="font-medium">{disabledMessage}</span>
                  {maintenance && icon}
                </div>
              </div>
              <p className="text-sm text-stone-700">
                {maintenance
                  ? "Estamos trabalhando em melhorias para este recurso. Volte em breve!"
                  : "É necessário selecionar um usuário para acessar este recurso."}
              </p>
            </div>
          </div>
        )}
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="p-4 rounded-full bg-stone-100 border border-stone-200 shadow-sm">
              {icon}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-stone-900 mb-1">
                {title}
              </h2>
              <p className="text-stone-700">{description}</p>
            </div>
            <Button
              size="sm"
              className={`mt-2 ${
                isDisabled
                  ? "bg-stone-400 hover:bg-stone-500 cursor-not-allowed"
                  : "bg-stone-600 hover:bg-stone-700"
              } text-stone-50 transition-colors shadow-sm`}
            >
              {maintenance
                ? "Em Breve"
                : requiresUser && !selectedUser
                ? "Selecione um Usuário"
                : "Abrir"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// User Selector Component
function UserSelector({
  selectedUser,
  setSelectedUser,
  isDialogOpen,
  setIsDialogOpen,
  users,
  setConfigs,
}) {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-stone-100 border-stone-300 text-stone-800 hover:bg-stone-200 shadow-md transition-all"
        >
          {selectedUser ? (
            <>
              <Avatar className="h-6 w-6 border border-stone-300">
                <AvatarImage
                  src={`https://cdn.discordapp.com/avatars/${selectedUser.id}/${selectedUser.avatar}`}
                  alt={selectedUser.name}
                />
                <AvatarFallback className="bg-stone-200 text-stone-800 text-xs">
                  {selectedUser.name.slice(0, 5).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-bold">{selectedUser.name}</span>
            </>
          ) : (
            <>
              <User className="h-4 w-4" />
              <span>Selecionar Usuário</span>
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-md border-stone-200"
        style={{ backgroundColor: "#ebe0d6" }}
        onInteractOutside={() => setIsDialogOpen(false)}
      >
        <DialogHeader>
          <DialogTitle className="text-stone-900">
            Selecione um Usuário
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {users.length > 0 ? (
            users.map((user) => (
              <Button
                key={user.id}
                variant="outline"
                className={`flex items-center justify-start gap-3 p-3 h-auto border-stone-200 hover:bg-stone-100 transition-all ${
                  selectedUser?.id === user.id
                    ? "bg-stone-200/90 border-stone-400 ring-4 ring-stone-400"
                    : "bg-stone-50"
                }`}
                onClick={() => {
                  setSelectedUser(user);
                  localStorage.setItem("user", JSON.stringify(user));
                  setConfigs(user);
                  setIsDialogOpen(false);
                }}
              >
                <Avatar className="h-16 w-16 border-2 border-stone-200">
                  <AvatarImage
                    src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`}
                    alt={user.name}
                  />
                  <AvatarFallback className="bg-stone-100 text-stone-800">
                    {user.name.slice(0, 5).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="font-bold text-stone-900">{user.name}</div>
                  <div className="text-xs text-neutral-400">{user.id}</div>
                </div>
              </Button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center w-full">
              <OrbitProgress color="#57534e" />
              <div className="text-center text-stone-500">
                Carregando usuários...
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Quotes Section Component
function QuotesSection({
  selectedUser,
  quotesData,
  onQuoteAction,
  currentUserQuote,
  users,
  streak,
}) {
  const adjustToBrazilianTime = (date) => addHours(new Date(date), -3);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-stone-800 mb-4 flex items-center">
        <span className="mr-2 flex gap-1 items-center">
          Citações do Dia -
          <div className="flex items-center justify-center text-neutral-500 gap-1 text-base">
            <Flame
              className={`text-6xl ${
                streak > 0
                  ? "text-orange-700 flame-animate"
                  : "text-stone-700 fill-stone-500"
              }`}
            />
            <div className="font-bold">
              {streak} {streak === 1 ? "dia" : "dias"}...
            </div>
          </div>
        </span>
        <div className="h-px flex-grow bg-stone-300 ml-2"></div>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
        {quotesData.length > 0 ? (
          quotesData
            .filter((e) =>
              isSameDay(
                adjustToBrazilianTime(new Date(e.date)),
                adjustToBrazilianTime(new Date())
              )
            )
            .map((quote) => {
              const user = users.find((u) => u.id === quote.authorId);
              const isCurrentUser = selectedUser?.id === quote.authorId;

              return (
                <div key={quote.id}>
                  {users.length <= 0 ? (
                    <div
                      className="p-5 rounded-lg shadow-md bg-stone-50/50"
                      style={{ backgroundColor: "#ebe0d6" }}
                    >
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4 rounded" />
                          <Skeleton className="h-3 w-1/2 rounded" />
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <Skeleton className="h-3 w-full rounded" />
                        <Skeleton className="h-3 w-5/6 rounded" />
                      </div>
                    </div>
                  ) : (
                    <div
                      key={quote.id}
                      className={`p-5 rounded-lg shadow-md transition-all ${
                        isCurrentUser
                          ? "ring-2 ring-stone-400 bg-stone-50"
                          : "bg-stone-50/50"
                      }`}
                      style={{
                        backgroundColor: isCurrentUser ? "#ebe0d6" : "#ebe0d6",
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar
                          className={`h-10 w-10 border-2 ${
                            isCurrentUser
                              ? "border-stone-400"
                              : "border-stone-200"
                          } mt-1`}
                        >
                          <AvatarImage
                            src={`https://cdn.discordapp.com/avatars/${user?.id}/${user?.avatar}`}
                            alt={user?.name}
                          />
                          <AvatarFallback className="bg-stone-200 text-stone-800 text-xs">
                            {user?.name.slice(0, 5).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <h3 className="font-bold text-stone-900">
                              {quote.author}{" "}
                              <span className="italic font-normal text-neutral-500">
                                disse:
                              </span>
                            </h3>
                            {isCurrentUser && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 rounded-full text-stone-700 hover:text-stone-900 hover:bg-stone-200 transition-colors"
                                onClick={() => onQuoteAction(quote)}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Editar citação</span>
                              </Button>
                            )}
                          </div>
                          <p className="text-stone-900">{quote.quote}</p>
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-sm text-neutral-500 font-medium">
                              — {user?.name}
                            </p>
                            <p className="text-xs text-stone-600">
                              Postado hoje às {format(quote.date, "HH:mm")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
        ) : (
          <div className="text-lg text-center md:translate-x-2/4 text-neutral-500 font-bold w-full">
            Nenhuma citação foi adiconada hoje!
          </div>
        )}
      </div>

      {selectedUser && users.length >= 0 && (
        <div className="flex justify-center mt-4">
          {currentUserQuote ? (
            <Button
              size="sm"
              className="bg-stone-600 hover:bg-stone-700 text-stone-50 flex items-center gap-2 shadow-sm transition-colors"
              onClick={() => onQuoteAction(currentUserQuote)}
            >
              <Edit className="h-4 w-4" />
              Editar Minha Citação
            </Button>
          ) : (
            <Button
              size="sm"
              className="bg-stone-600 hover:bg-stone-700 text-stone-50 flex items-center gap-2 shadow-sm transition-colors"
              onClick={() => onQuoteAction(null)}
            >
              <Plus className="h-4 w-4" />
              Adicionar Citação
            </Button>
          )}
        </div>
      )}

      {!selectedUser && (
        <div className="text-center p-3 bg-stone-100 rounded-lg border border-stone-200 text-stone-800 mt-4 shadow-sm">
          <p>Selecione um usuário para adicionar sua própria citação</p>
        </div>
      )}
    </div>
  );
}
