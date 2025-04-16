import { useState, useEffect } from "react";

import { api } from "@/utils";
import { prisma } from "@/lib/database";

import { GoBackButton } from "@/components";

import Head from "next/head";

import {
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  getYear,
  setYear,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Heart,
  LayoutList,
  Plus,
  Check,
  Trash2,
  Circle,
  MoveLeft,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { cn } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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

import { Calendar } from "@/components/ui/calendar";

export const getServerSideProps = async () => {
  const events = await prisma.events.findMany({
    orderBy: [
      {
        date: "asc",
      },
    ],
  });

  const serialized = JSON.parse(JSON.stringify(events));

  return {
    props: {
      rawEvents: serialized,
    },
  };
};

// Main Page Component
export default function Home({ rawEvents }) {
  // Media Query Hook
  const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
      const media = window.matchMedia(query);
      setMatches(media.matches);

      const listener = (event) => {
        setMatches(event.matches);
      };

      media.addEventListener("change", listener);
      return () => {
        media.removeEventListener("change", listener);
      };
    }, [query]);

    return matches;
  };

  const isMobile = useMediaQuery("(max-width: 767px)");

  // Timeline State
  const [items, setItems] = useState(rawEvents);
  const [sortBy, setSortBy] = useState("asc");

  // UI State
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeView, setActiveView] = useState("timeline");
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  // Calendar View State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDate, setFormDate] = useState(new Date());
  const [formHeart, setFormHeart] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarSelectedDate, setCalendarSelectedDate] = useState(new Date());

  // Calendar Navigation
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Year selection
  const currentYear = getYear(currentMonth);
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  const handleYearChange = (year) => {
    setCurrentMonth(setYear(currentMonth, Number.parseInt(year)));
  };

  // Get days in current month for calendar view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get entries for selected day
  const selectedDayEntries = selectedDay
    ? items.filter((item) => isSameDay(item.date, selectedDay))
    : [];

  // Get entries for each day in month (for hearts)
  const getDayEntries = (day) => {
    return items.filter((item) => isSameDay(item.date, day));
  };

  // Sort items by date (newest first)
  const sortedItems = [...items].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Form Handlers
  const openNewItemForm = () => {
    setEditingItem(null);
    setFormTitle("");
    setFormDescription("");
    setFormDate(new Date());
    setCalendarSelectedDate(new Date());
    setOpen(true);
  };

  const openEditItemForm = (item) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormDescription(item.description);
    setFormDate(item.date);
    setCalendarSelectedDate(item.date);
    setOpen(true);
  };

  const handleAddItem = ({ type, value }) => {
    if (!formDate || value == false) return;

    if (type == "heart") {
      api
        .post("/events", {
          date: formDate,
          heart: true,
          createdAt: new Date(),
        })
        .then((res) => {
          api.post("/notifications", {
            body: `${
              JSON.parse(localStorage.getItem("user")).name
            } adicionou um "favorito" no timeline!`,
            url: "/timeline",
            userId: JSON.parse(localStorage.getItem("user")).id,
          });
          setItems([...items, res.data]);
        });
    } else {
      api
        .post("/events", {
          date: formDate,
          title: formTitle,
          description: formDescription,
          heart: false,
          createdAt: new Date(),
        })
        .then((res) => {
          api.post("/notifications", {
            body: `${
              JSON.parse(localStorage.getItem("user")).name
            } adicionou uma entrada no timeline!`,
            url: "/timeline",
            userId: JSON.parse(localStorage.getItem("user")).id,
          });
          setItems([...items, res.data]);
        });
    }

    setOpen(false);
  };

  const handleEditItem = ({ type, value }) => {
    if (!formDate) return;

    if (type == "heart") {
      selectedDayEntries.forEach((e) => {
        if (value === false && !e.description && !e.title) {
          // Automatically delete the item if it has no description or title
          api.delete(`/events/${e.id}`).then(() => {
            setItems(items.filter((item) => item.id !== e.id));
          });
        } else {
          api
            .put(`/events/${e.id}`, {
              ...e,
              heart: value,
            })
            .then((res) => {
              setItems(
                items.map((item) => (item.id === e.id ? res.data : item))
              );
            });
        }
      });
    } else {
      api
        .put(`/events/${editingItem.id}`, {
          ...editingItem,
          title: formTitle,
          description: formDescription,
          date: formDate,
        })
        .then((res) => {
          setItems((prevItems) => {
            const updatedItems = prevItems.map((item) =>
              item.id === editingItem.id ? res.data : item
            );
            // Add the item if it doesn't exist in the list
            if (!updatedItems.some((item) => item.id === editingItem.id)) {
              updatedItems.push(res.data);
            }
            return updatedItems;
          });

          api.post("/notifications", {
            body: `${
              JSON.parse(localStorage.getItem("user")).name
            } atualizou sua entrada no timeline!`,
            url: "/timeline",
            userId: JSON.parse(localStorage.getItem("user")).id,
          });

          setEditingItem(null);
          setOpen(false);
        });
    }
  };

  const handleDeleteItem = () => {
    if (!editingItem) return;

    api.delete(`/events/${editingItem.id}`).then(() => {
      setItems(items.filter((item) => item.id !== editingItem.id));
      setEditingItem(null);
      setShowDeleteAlert(false);
      setOpen(false);
    });
  };

  const handleSubmit = () => {
    if (editingItem) {
      handleEditItem({ type: "add" });
    } else {
      handleAddItem({ type: "add" });
    }
  };

  const handleHeartChange = (e) => {
    if (selectedDayEntries.length <= 0) {
      handleAddItem({ type: "heart", value: e });
    } else {
      handleEditItem({ type: "heart", value: e });
    }
  };

  // Calendar Popover Component
  const CalendarPopover = ({ date, onChange }) => {
    const [selectedDate, setSelectedDate] = useState(date);
    const [popoverYear, setPopoverYear] = useState(getYear(date));
    const [popoverMonth, setPopoverMonth] = useState(date);

    const handleYearChange = (year) => {
      const newDate = setYear(popoverMonth, Number.parseInt(year));
      setPopoverMonth(newDate);
      setPopoverYear(Number.parseInt(year));
    };

    const handleConfirm = () => {
      if (selectedDate === undefined) return;

      setFormDate(selectedDate);
      setCalendarOpen(false);
    };

    return (
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal border-emerald-200",
              !formDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formDate ? (
              format(formDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
            ) : (
              <span>Escolha uma data</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align={isMobile ? "center" : "start"}
          sideOffset={isMobile ? 5 : -50}
          style={{ zIndex: isMobile ? 100 : 50 }}
        >
          <div className="p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(e) => {
                setSelectedDate(e);
                onChange(e);
              }}
            />

            <div className="flex justify-end gap-2 mt-3 px-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCalendarOpen(false)}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleConfirm}
                disabled={selectedDate === undefined}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Check className="h-4 w-4 mr-1" />
                Confirmar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  // Timeline Entry Component
  const TimelineEntry = ({ item, position }) => {
    return (
      <div className="relative">
        {/* Central line connector - no dots */}
        <div
          className={`absolute top-[31px] ${
            position === "left" ? "right-1/2" : "left-1/2"
          } w-6 md:w-12 h-[2px] bg-emerald-400`}
        ></div>

        {/* Content positioned to left or right */}
        <div
          className={`flex ${
            position === "left"
              ? "justify-end pr-6 md:pr-12"
              : "justify-start pl-6 md:pl-12"
          } w-1/2 ${position === "left" ? "mr-auto" : "ml-auto"}`}
        >
          {/* Horizontal connector line */}
          <div
            className={`absolute top-[31px] ${
              position === "left"
                ? "right-1/2 w-6 md:w-12"
                : "left-1/2 w-6 md:w-12"
            } h-[1px] bg-emerald-400`}
          ></div>

          <Card className="hover:shadow-md transition-shadow w-full max-w-md bg-white border-emerald-100">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <div className="flex items-center text-sm text-emerald-700">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <time dateTime={new Date(item.date).toISOString()}>
                  {format(item.date, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </time>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEditItemForm(item)}
                className="h-8 w-8 p-0 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Editar</span>
              </Button>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <h3 className="font-medium text-lg mb-1 text-emerald-900">
                {item.title}
              </h3>
              <p className="text-emerald-700">{item.description}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Mobile Timeline View Component
  const MobileTimelineView = () => {
    return (
      <div className="relative">
        {/* Central line */}
        <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-emerald-400"></div>

        <div className="space-y-6">
          {sortedItems
            .filter((e) => e.description)
            .sort((a, b) => {
              if (sortBy === "desc") {
                return new Date(a.date) - new Date(b.date);
              } else {
                return new Date(b.date) - new Date(a.date);
              }
            })
            .map((item) => (
              <div key={item.id} className="relative pl-12">
                {/* Horizontal connector line - no dots */}
                <div className="absolute top-[28px] left-4 w-8 h-[2px] bg-emerald-400"></div>

                <Card className="hover:shadow-md transition-shadow w-full bg-white border-emerald-100">
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                    <div className="flex items-center text-sm text-emerald-700">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <time dateTime={new Date(item.date).toISOString()}>
                        {format(item.date, "d 'de' MMMM 'de' yyyy", {
                          locale: ptBR,
                        })}
                      </time>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditItemForm(item)}
                      className="h-8 w-8 p-0 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <h3 className="font-medium text-lg mb-1 text-emerald-900">
                      {item.title}
                    </h3>
                    <p className="text-emerald-700">{item.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
        </div>
      </div>
    );
  };

  // Calendar View Component
  const CalendarViewComponent = () => {
    return (
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Calendar */}
          <Card className="w-full md:w-1/2 bg-white border-emerald-100">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevMonth}
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Mês anterior</span>
                </Button>

                <div className="flex items-center gap-2">
                  <CardTitle className="text-emerald-900">
                    {format(currentMonth, "MMMM", { locale: ptBR })}
                  </CardTitle>

                  <Select
                    value={currentYear.toString()}
                    onValueChange={handleYearChange}
                  >
                    <SelectTrigger className="w-[80px] h-8 border-emerald-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextMonth}
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Próximo mês</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Day names */}
              <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                {["D", "S", "T", "Q", "Q", "S", "S"].map((day, index) => (
                  <div
                    key={index}
                    className="py-1 text-emerald-700 text-xs font-medium"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {daysInMonth.map((day, i) => {
                  const dayEntries = getDayEntries(day);
                  const hasEntries = dayEntries.length > 0;
                  const hasHeartedEntries = dayEntries.some(
                    (entry) => entry.heart
                  );

                  return (
                    <Button
                      key={i}
                      variant={
                        isSameDay(day, selectedDay ?? new Date(-1))
                          ? "default"
                          : "outline"
                      }
                      className={cn(
                        "min-h-10 h-min w-full py-2 p-0 font-normal flex flex-col justify-center items-center gap-0.5",
                        !isSameMonth(day, currentMonth) &&
                          "text-muted-foreground",
                        isToday(day) &&
                          !isSameDay(day, selectedDay ?? new Date(-1)) &&
                          "border-emerald-500 text-emerald-700",
                        isSameDay(day, selectedDay ?? new Date(-1)) &&
                          "bg-emerald-600 text-white hover:bg-emerald-700",
                        !isSameDay(day, selectedDay ?? new Date(-1)) &&
                          "border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50"
                      )}
                      onClick={() => {
                        setSelectedDay(day);
                        const entries = day
                          ? items.filter((item) => isSameDay(item.date, day))
                          : [];
                        const d = entries.filter((e) => e.heart === true);
                        setFormHeart(d.length > 0 ? true : false);
                        setFormDate(day);
                      }}
                    >
                      <time dateTime={format(day, "yyyy-MM-dd")}>
                        {format(day, "d")}
                      </time>
                      <div>
                        {hasEntries && (
                          <div>
                            {hasHeartedEntries ? (
                              <Heart
                                className={cn(
                                  "h-2 w-2",
                                  isSameDay(day, selectedDay ?? new Date(-1))
                                    ? "text-white"
                                    : hasHeartedEntries &&
                                        "fill-rose-500 text-rose-500"
                                )}
                              />
                            ) : (
                              <Circle className="h-2 w-2 fill-emerald-300 text-emerald-300" />
                            )}
                          </div>
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Daily view */}
          <Card className="w-full md:w-1/2 bg-white border-emerald-100">
            <CardHeader>
              <CardTitle className="text-emerald-900">
                {selectedDay
                  ? format(selectedDay, "d 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })
                  : "Selecione um dia"}
              </CardTitle>
              <CardDescription className="text-emerald-600">
                {selectedDayEntries.length === 0
                  ? "Nenhuma entrada para este dia"
                  : (() => {
                      // Filter out items with no title/description and heart is true
                      const validEntries = selectedDayEntries.filter(
                        (e) => e.description || e.title
                      );
                      return `${
                        validEntries.length == 0
                          ? "Nenhuma"
                          : validEntries.length
                      } ${validEntries.length <= 1 ? "entrada" : "entradas"} ${
                        validEntries.length == 0 ? "para este dia" : ""
                      }`;
                    })()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDay &&
                selectedDayEntries.filter((e) => e.description || e.title)
                  .length > 0 && (
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                      {selectedDayEntries.length === 0 ? (
                        <p className="text-center text-emerald-600 py-8">
                          Nenhuma entrada para este dia
                        </p>
                      ) : (
                        selectedDayEntries.map((entry) => (
                          <Card
                            key={entry.id}
                            className="overflow-hidden bg-emerald-50 border-emerald-100"
                          >
                            <CardHeader className="p-4 pb-2">
                              <CardTitle className="text-lg text-emerald-900">
                                {entry.title}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-2">
                              <p className="text-emerald-700">
                                {entry.description}
                              </p>
                            </CardContent>
                            <CardFooter className="p-4 pt-0 flex justify-between">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-auto text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100"
                                onClick={() => openEditItemForm(entry)}
                              >
                                Editar
                              </Button>
                            </CardFooter>
                          </Card>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                )}
            </CardContent>
            <CardFooter>
              {selectedDay && (
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formHeart}
                    onCheckedChange={(e) => {
                      setFormHeart(e);
                      handleHeartChange(e);
                    }}
                    className="data-[state=checked]:bg-rose-500"
                    aria-labelledby="heart-label"
                  />
                  <Label
                    htmlFor="heart"
                    id="heart-label"
                    className="flex items-center"
                  >
                    <Heart
                      className={`h-4 w-4 mr-2 ${
                        formHeart ? "fill-rose-500 text-rose-500" : ""
                      }`}
                    />
                    Marcar como "favorito"
                  </Label>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  };

  // Form Component
  const TimelineFormComponent = ({ editingItem, setEditingItemValues }) => {
    const [formTitleValue, setFormTitleValue] = useState(
      editingItem?.title || formTitle
    );
    const [formDescriptionValue, setFormDescriptionValue] = useState(
      editingItem?.description || formDescription
    );
    const [formDateValue, setFormDateValue] = useState(
      editingItem?.date || formDate
    );

    return (
      <>
        <div className="space-y-2">
          <Label>Título</Label>
          <Input
            id="title"
            value={formTitleValue}
            onChange={(e) => {
              setFormTitleValue(e.target.value);
            }}
            onBlur={(e) => {
              setEditingItemValues({
                title: e.target.value,
              });
            }}
            placeholder="Digite um título"
            required
            className="border-emerald-200 focus-visible:ring-emerald-500"
          />
        </div>

        <div className="space-y-2">
          <Label>Data</Label>
          <CalendarPopover
            date={formDateValue}
            onChange={(e) => {
              setFormDateValue(e);
              setEditingItemValues({
                date: e,
              });
              setCalendarOpen(false);
            }}
          />
        </div>

        <div className="space-y-2">
          <Label>Descrição</Label>
          <Textarea
            id="description"
            value={formDescriptionValue}
            onChange={(e) => {
              setFormDescriptionValue(e.target.value);
            }}
            onBlur={(e) => {
              setEditingItemValues({
                description: e.target.value,
              });
            }}
            placeholder="Digite uma descrição"
            className="min-h-[120px] border-emerald-200 focus-visible:ring-emerald-500 resize-none"
            required
          />
        </div>

        <div className="flex justify-end gap-4 pt-4">
          {editingItem && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteAlert(true)}
              className="text-destructive hover:text-destructive border-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          )}
          <Button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSubmit();

              setEditingItemValues({
                title: formTitleValue,
                description: formDescriptionValue,
                date: formDateValue,
              });
            }}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {editingItem ? "Salvar Alterações" : "Adicionar Entrada"}
          </Button>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#f0fdf4]">
      <Head>
        <title>Cafofo Estelar - Timeline</title>
        <meta name="theme_color" content="#f0fdf4" />
        <meta name="theme-color" content="#f0fdf4" />
      </Head>
      <GoBackButton />
      <div className="flex flex-col items-center justify-start pt-16 bg-green-50 text-black">
        <div className="font-logo text-4xl text-neutral-700 mt-1">Timeline</div>
        <div className="text-xs text-neutral-500 mt-2 uppercase">
          {"Timeline de eventos!"}
        </div>
      </div>
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="flex sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <Tabs
                value={activeView}
                onValueChange={setActiveView}
                className="w-auto"
              >
                <TabsList className="bg-emerald-100">
                  <TabsTrigger
                    value="timeline"
                    className="data-[state=active]:bg-white"
                  >
                    <LayoutList className="h-4 w-4 mr-2" />
                    Linha do Tempo
                  </TabsTrigger>
                  <TabsTrigger
                    value="calendar"
                    className="data-[state=active]:bg-white"
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Calendário
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <div
                onClick={() => setSortBy(sortBy === "asc" ? "desc" : "asc")}
                className="p-2 bg-emerald-100 rounded-lg hover:bg-emerald-300/60 transition cursor-pointer"
              >
                {sortBy === "asc" ? (
                  <SortDesc className="text-neutral-500" />
                ) : (
                  <SortAsc className="text-neutral-500" />
                )}
              </div>
            </div>

            {items.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma entrada na linha do tempo. Adicione uma para começar!
              </p>
            ) : (
              <Tabs value={activeView} className="w-full">
                <TabsContent value="timeline" className="mt-0">
                  {isMobile ? (
                    <MobileTimelineView />
                  ) : (
                    <div className="relative">
                      {/* Central line */}
                      <div className="absolute left-1/2 -translate-x-[0.5px] top-0 bottom-0 w-[2px] bg-emerald-400"></div>

                      <div className="space-y-12">
                        {sortedItems
                          .filter((e) => e.description)
                          .sort((a, b) => {
                            if (sortBy === "desc") {
                              return new Date(a.date) - new Date(b.date);
                            } else {
                              return new Date(b.date) - new Date(a.date);
                            }
                          })
                          .map((item, index) => {
                            const isLeft = index % 2 === 0;
                            return (
                              <TimelineEntry
                                key={item.id}
                                item={item}
                                position={isLeft ? "left" : "right"}
                              />
                            );
                          })}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="calendar" className="mt-0">
                  <CalendarViewComponent />
                </TabsContent>
              </Tabs>
            )}

            {/* Floating Action Button */}
            <Button
              onClick={openNewItemForm}
              className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-emerald-600 hover:bg-emerald-700 z-10"
              size="icon"
            >
              <Plus className="h-6 w-6" />
              <span className="sr-only">Adicionar Entrada</span>
            </Button>

            {!isMobile ? (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[550px] bg-white outline-none border-none">
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? "Editar Entrada" : "Adicionar Entrada"}
                    </DialogTitle>
                  </DialogHeader>
                  <TimelineFormComponent
                    editingItem={editingItem}
                    setEditingItemValues={(e) => {
                      if (editingItem?.description) {
                        setEditingItem({
                          ...editingItem,
                          ...e,
                        });
                      }
                      setFormDate(e.date ? e.date : formDate);
                      setFormTitle(e.title ? e.title : formTitle);
                      setFormDescription(
                        e.description ? e.description : formDescription
                      );
                    }}
                  />
                </DialogContent>
              </Dialog>
            ) : (
              <Drawer open={open} onOpenChange={setOpen}>
                <DrawerContent className="bg-white outline-none border-none">
                  <DrawerHeader>
                    <DrawerTitle>
                      {editingItem ? "Editar Entrada" : "Adicionar Entrada"}
                    </DrawerTitle>
                  </DrawerHeader>
                  <div className="px-4 pb-4">
                    <TimelineFormComponent
                      editingItem={editingItem}
                      setEditingItemValues={(e) => {
                        if (editingItem?.description) {
                          setEditingItem({
                            ...editingItem,
                            ...e,
                          });
                        }

                        setFormDate(e.date ? e.date : formDate);
                        setFormTitle(e.title ? e.title : formTitle);
                        setFormDescription(
                          e.description ? e.description : formDescription
                        );
                      }}
                    />
                  </div>
                </DrawerContent>
              </Drawer>
            )}

            <AlertDialog
              open={showDeleteAlert}
              onOpenChange={setShowDeleteAlert}
            >
              <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá
                    permanentemente a entrada da linha do tempo.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteItem}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
