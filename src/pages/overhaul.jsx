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
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useMediaQuery } from "@/hooks/use-mobile";
import { OrbitProgress } from "react-loading-indicators";

export const getServerSideProps = async () => {
  const startOfDay = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  );
  const endOfDay = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate() + 1
  );

  const quotes = await prisma.quotes.findMany({
    where: {
      AND: [
        {
          date: {
            gte: startOfDay, // Convert to timestamp (milliseconds)
          },
        },
        {
          date: {
            lt: endOfDay, // Convert to timestamp (milliseconds)
          },
        },
      ],
    },
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

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setConfigs((prevConfigs) => ({
        ...prevConfigs,
        user: JSON.parse(user),
      }));
    }
  }, []);

  // Close dialog when user is selected
  useEffect(() => {
    if (selectedUser && isDialogOpen) {
      setIsDialogOpen(false);
    }
  }, [selectedUser, isDialogOpen]);

  const handleOpenQuoteDialog = (quote = null) => {
    if (quote) {
      // Edit mode
      setNewQuoteTitle(quote.title);
      setNewQuoteContent(quote.content);
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
      const updatedQuotes = quotesData.map((q) =>
        q.id === editingQuote.id
          ? { ...q, title: newQuoteTitle, content: newQuoteContent }
          : q
      );
      setQuotesData(updatedQuotes);
    } else {
      // Add new quote
      const newQuote = {
        id: Date.now(),
        userId: selectedUser.id,
        title: newQuoteTitle,
        content: newQuoteContent,
        postedAt: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setQuotesData([...quotesData, newQuote]);
    }

    // Reset form and close dialog
    setNewQuoteTitle("");
    setNewQuoteContent("");
    setEditingQuote(null);
    setIsAddQuoteOpen(false);
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    setIsNotificationDialogOpen(false);
  };

  // Find if current user has a quote
  const currentUserQuote = selectedUser
    ? quotesData.find((quote) => quote.userId === selectedUser.id)
    : null;

  return (
    <div
      className="min-h-screen cafofo-page"
      style={{ backgroundColor: "#f3eae3" }}
    >
      <style jsx global>{`
        .cafofo-page .font-handwriting {
          font-family: var(--font-caveat), cursive;
          font-weight: 700;
          letter-spacing: 0.02em;
          text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.05);
        }

        .cafofo-page .hover-scale:hover {
          transform: scale(1.03);
        }
      `}</style>

      <div
        className="sticky top-0 z-20 py-2 px-4 shadow-sm"
        style={{ backgroundColor: "#f3eae3" }}
      >
        <div className="container mx-auto flex justify-between items-center">
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

          <UserSelector
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            getUsers={getUsers}
            setConfigs={(e) => {
              setConfigs({
                ...configs,
                users: e,
              });
            }}
          />
        </div>
      </div>

      <header className="container mx-auto py-6 px-4">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-logo text-center text-stone-800 mb-2 drop-shadow-sm">
            Cafofo Estelar
          </h1>
          <p className="text-center text-stone-700">
            Seu espaço pessoal para pensamentos e sonhos
          </p>
        </div>

        <QuotesSection
          selectedUser={selectedUser}
          quotesData={quotesData}
          onQuoteAction={handleOpenQuoteDialog}
          currentUserQuote={currentUserQuote}
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
            description="Acompanhe suas contagens"
          />

          <LinkCard
            href="/list"
            icon={<Film className="h-6 w-6 text-stone-700" />}
            title="Filmes & Séries"
            description="Gerencie sua lista de filmes e séries"
            requiresUser={true}
            selectedUser={selectedUser}
          />

          <LinkCard
            href="/timeline"
            icon={<Clock className="h-6 w-6 text-stone-700" />}
            title="Linha do Tempo"
            description="Veja suas atividades recentes"
          />

          <LinkCard
            href="/journals"
            icon={<BookText className="h-6 w-6 text-stone-700" />}
            title="Diários"
            description="Suas anotações pessoais"
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
        <div className="container mx-auto px-4 text-center text-stone-700 text-sm">
          <p>© 2025 Cafofo Estelar. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* Add/Edit Quote Dialog/Drawer */}
      {isMobile ? (
        <Drawer open={isAddQuoteOpen} onOpenChange={setIsAddQuoteOpen}>
          <DrawerContent>
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
                  <Label htmlFor="quote-title-mobile">Título</Label>
                  <Input
                    id="quote-title-mobile"
                    placeholder="Título da sua citação..."
                    value={newQuoteTitle}
                    onChange={(e) => setNewQuoteTitle(e.target.value)}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quote-content-mobile">Sua Citação</Label>
                  <Textarea
                    id="quote-content-mobile"
                    placeholder="Digite sua citação aqui..."
                    value={newQuoteContent}
                    onChange={(e) => setNewQuoteContent(e.target.value)}
                    className="min-h-[120px] resize-none bg-white ring-2 ring-stone-600"
                  />
                </div>
              </div>
            </div>
            <DrawerFooter>
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
          <DialogContent
            className="sm:max-w-md"
            style={{ backgroundColor: "#ebe0d6" }}
          >
            <DialogHeader>
              <DialogTitle>
                {editingQuote ? "Editar Citação" : "Adicionar Nova Citação"}
              </DialogTitle>
              <DialogDescription>
                Compartilhe seus pensamentos com a comunidade.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="quote-title">Título</Label>
                <Input
                  id="quote-title"
                  placeholder="Título da sua citação..."
                  value={newQuoteTitle}
                  onChange={(e) => setNewQuoteTitle(e.target.value)}
                  // className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quote-content">Sua Citação</Label>
                <Textarea
                  id="quote-content"
                  placeholder="Digite sua citação aqui..."
                  value={newQuoteContent}
                  onChange={(e) => setNewQuoteContent(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
              </div>
            </div>
            <DialogFooter>
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
          <div className="flex items-center justify-between py-4">
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
              className={notificationsEnabled ? "bg-green-600" : ""}
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
  getUsers,
  setConfigs,
}) {
  const [users, setUsers] = useState([]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            const users = await getUsers();
            setUsers(users.data);
          }}
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
                    ? "bg-stone-100 border-stone-400 ring-1 ring-stone-400"
                    : "bg-stone-50"
                }`}
                onClick={() => setSelectedUser(user)}
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
}) {
  const users = [
    { id: 1, name: "João Silva", avatar: "/placeholder.svg", initials: "JS" },
    {
      id: 2,
      name: "Maria Oliveira",
      avatar: "/placeholder.svg",
      initials: "MO",
    },
    {
      id: 3,
      name: "Carlos Santos",
      avatar: "/placeholder.svg",
      initials: "CS",
    },
    { id: 4, name: "Ana Pereira", avatar: "/placeholder.svg", initials: "AP" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-stone-800 mb-4 flex items-center">
        <span className="mr-2">Citações do Dia</span>
        <div className="h-px flex-grow bg-stone-300 ml-4"></div>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quotesData.length > 0 ? (
          quotesData.map((quote) => {
            const user = users.find((u) => u.id === quote.userId);
            const isCurrentUser = selectedUser?.id === quote.userId;

            return (
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
                      isCurrentUser ? "border-stone-400" : "border-stone-200"
                    } mt-1`}
                  >
                    <AvatarImage
                      src={user?.avatar || "/placeholder.svg"}
                      alt={user?.name}
                    />
                    <AvatarFallback className="bg-stone-100 text-stone-800">
                      {user?.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-medium text-stone-900">
                        {quote.title}
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
                    <p className="text-stone-900 italic">"{quote.content}"</p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-stone-700 font-medium">
                        — {user?.name}
                      </p>
                      <p className="text-xs text-stone-600">
                        Postado hoje às {quote.postedAt}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-lg text-center translate-x-2/4 text-neutral-500 font-bold w-full">
            Nenhuma citação foi adiconada hoje!
          </div>
        )}
      </div>

      {selectedUser && (
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
