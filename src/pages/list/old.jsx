"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Check,
  Filter,
  Plus,
  Search,
  X,
  Shuffle,
  Dice6,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-mobile";

// Mock data for demonstration
const mockMovies = [
  {
    id: 1,
    name: "The Matrix",
    image: "/placeholder.svg?height=450&width=300",
    type: "movie",
    watched: false,
    genres: JSON.stringify([28, 878, 53]),
    providers: JSON.stringify([]),
    date: new Date("2024-01-15"),
    dateWatched: null,
    addedBy: JSON.stringify({ id: "1", name: "John", avatar: "avatar1" }),
  },
  {
    id: 2,
    name: "Stranger Things",
    image: "/placeholder.svg?height=450&width=300",
    type: "tv",
    watched: false,
    genres: JSON.stringify([18, 9648, 878]),
    providers: JSON.stringify([]),
    date: new Date("2024-01-20"),
    dateWatched: null,
    addedBy: JSON.stringify({ id: "2", name: "Jane", avatar: "avatar2" }),
  },
  {
    id: 3,
    name: "Inception",
    image: "/placeholder.svg?height=450&width=300",
    type: "movie",
    watched: true,
    genres: JSON.stringify([28, 878, 53]),
    providers: JSON.stringify([]),
    date: new Date("2024-01-10"),
    dateWatched: new Date("2024-01-25"),
    addedBy: JSON.stringify({ id: "1", name: "John", avatar: "avatar1" }),
  },
  {
    id: 4,
    name: "Breaking Bad",
    image: "/placeholder.svg?height=450&width=300",
    type: "tv",
    watched: false,
    genres: JSON.stringify([18, 80]),
    providers: JSON.stringify([]),
    date: new Date("2024-01-12"),
    dateWatched: null,
    addedBy: JSON.stringify({ id: "2", name: "Jane", avatar: "avatar2" }),
  },
  {
    id: 5,
    name: "Interstellar",
    image: "/placeholder.svg?height=450&width=300",
    type: "movie",
    watched: false,
    genres: JSON.stringify([18, 878]),
    providers: JSON.stringify([]),
    date: new Date("2024-01-18"),
    dateWatched: null,
    addedBy: JSON.stringify({ id: "1", name: "John", avatar: "avatar1" }),
  },
  {
    id: 6,
    name: "The Office",
    image: "/placeholder.svg?height=450&width=300",
    type: "tv",
    watched: false,
    genres: JSON.stringify([35]),
    providers: JSON.stringify([]),
    date: new Date("2024-01-22"),
    dateWatched: null,
    addedBy: JSON.stringify({ id: "2", name: "Jane", avatar: "avatar2" }),
  },
];

const mockUsers = [
  { id: "1", name: "John", avatar: "avatar1" },
  { id: "2", name: "Jane", avatar: "avatar2" },
];

export default function MovieCarousel() {
  const [allMovies, setAllMovies] = useState(mockMovies);
  const scrollContainerRef = useRef(null);
  const tvScrollContainerRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [tvScrollPosition, setTvScrollPosition] = useState(0);
  const [tvMaxScroll, setTvMaxScroll] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [open, setOpen] = useState(false);
  const [mainSearchQuery, setMainSearchQuery] = useState("");
  const [filterByGenre, setFilterByGenre] = useState(null);
  const [filterByUser, setFilterByUser] = useState(null);
  const [users, setUsers] = useState(mockUsers);
  const [randomItem, setRandomItem] = useState(null);
  const [isRandomItemOpen, setIsRandomItemOpen] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffleItems, setShuffleItems] = useState([]);
  const [currentShuffleIndex, setCurrentShuffleIndex] = useState(0);

  const isMobile = useMediaQuery("(max-width: 768px)");

  // Filter movies and TV shows
  const movies = allMovies
    .filter((movie) => {
      if (
        mainSearchQuery &&
        !movie.name.toLowerCase().includes(mainSearchQuery.toLowerCase())
      ) {
        return false;
      }
      if (filterByGenre && !JSON.parse(movie.genres).includes(filterByGenre)) {
        return false;
      }
      if (filterByUser && JSON.parse(movie.addedBy).id !== filterByUser) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (a.watched && !b.watched) return 1;
      if (!a.watched && b.watched) return -1;
      return new Date(b.date) - new Date(a.date);
    });

  const allGenres = Array.from(
    new Set(allMovies.flatMap((movie) => JSON.parse(movie.genres)))
  );

  const genres_ids = [
    { name: "Ação", id: 28 },
    { name: "Aventura", id: 12 },
    { name: "Animação", id: 16 },
    { name: "Comédia", id: 35 },
    { name: "Crime", id: 80 },
    { name: "Documentário", id: 99 },
    { name: "Drama", id: 18 },
    { name: "Família", id: 10751 },
    { name: "Fantasia", id: 14 },
    { name: "História", id: 36 },
    { name: "Terror", id: 27 },
    { name: "Música", id: 10402 },
    { name: "Mistério", id: 9648 },
    { name: "Romance", id: 10749 },
    { name: "Ficção Científica", id: 878 },
    { name: "Filme para TV", id: 10770 },
    { name: "Suspense", id: 53 },
    { name: "Guerra", id: 10752 },
    { name: "Faroeste", id: 37 },
  ];

  const isAtStart = scrollPosition <= 10;
  const isAtEnd = scrollPosition >= maxScroll - 10;
  const tvIsAtStart = tvScrollPosition <= 10;
  const tvIsAtEnd = tvScrollPosition >= tvMaxScroll - 10;

  const updateScrollInfo = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setScrollPosition(scrollLeft);
      setMaxScroll(scrollWidth - clientWidth);
    }
    if (tvScrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        tvScrollContainerRef.current;
      setTvScrollPosition(scrollLeft);
      setTvMaxScroll(scrollWidth - clientWidth);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      updateScrollInfo();
    }, 100);
    window.addEventListener("resize", updateScrollInfo);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateScrollInfo);
    };
  }, []);

  useEffect(() => {
    updateScrollInfo();
  }, [movies]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  const scrollTvLeft = () => {
    if (tvScrollContainerRef.current) {
      tvScrollContainerRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollTvRight = () => {
    if (tvScrollContainerRef.current) {
      tvScrollContainerRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  const handleFilterChange = (type, value) => {
    switch (type) {
      case "genre":
        setFilterByGenre(value === filterByGenre ? null : value);
        break;
      case "user":
        setFilterByUser(value === filterByUser ? null : value);
        break;
      case "clear":
        setFilterByGenre(null);
        setFilterByUser(null);
        setMainSearchQuery("");
        break;
    }
  };

  const getRandomFromList = () => {
    const unwatched = allMovies.filter((each) => each.watched === false);
    if (unwatched.length === 0) {
      setRandomItem(null);
      setIsRandomItemOpen(true);
      return;
    }

    // Create shuffle animation
    setIsShuffling(true);
    setIsRandomItemOpen(true);

    // Generate random sequence for animation
    const shuffleSequence = [];
    for (let i = 0; i < 20; i++) {
      shuffleSequence.push(
        unwatched[Math.floor(Math.random() * unwatched.length)]
      );
    }

    // Add the final selection
    const finalSelection =
      unwatched[Math.floor(Math.random() * unwatched.length)];
    shuffleSequence.push(finalSelection);

    setShuffleItems(shuffleSequence);
    setCurrentShuffleIndex(0);

    // Animate through the sequence
    let index = 0;
    const shuffleInterval = setInterval(
      () => {
        setCurrentShuffleIndex(index);
        index++;

        if (index >= shuffleSequence.length) {
          clearInterval(shuffleInterval);
          setIsShuffling(false);
          setRandomItem(finalSelection);
        }
      },
      index < 15 ? 100 : 200 + (index - 15) * 50
    ); // Slow down towards the end
  };

  const toggleWatched = (movie) => {
    setAllMovies(
      allMovies.map((each) =>
        each.id === movie.id
          ? {
              ...each,
              watched: !each.watched,
              dateWatched: !each.watched ? new Date() : null,
            }
          : each
      )
    );
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-slate-300">
      <div className="flex flex-col items-center pt-8 justify-start min-h-screen text-black">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Lista de Filmes</h1>
          <p className="text-lg text-muted-foreground">
            Filmes e séries para nós assistirmos juntinhos
          </p>
        </div>

        <div className="container md:max-w-4xl mx-auto py-8 px-4">
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Procurar na lista..."
                  className="pl-8 border-muted-foreground bg-white/15"
                  value={mainSearchQuery}
                  onChange={(e) => setMainSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-muted-foreground bg-white/15 hover:bg-white/30"
                    size="icon"
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filtrar por:</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleFilterChange("clear", null)}
                  >
                    Limpar filtros
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                className="border-muted-foreground bg-white/15 hover:bg-white/30"
                size="icon"
                onClick={getRandomFromList}
              >
                <Dice6 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Movies Section */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Filmes</h1>
              <Badge
                variant="outline"
                className="border-muted-foreground bg-white/15"
              >
                {movies.filter((each) => each.type === "movie").length} filme
                {movies.filter((each) => each.type === "movie").length !== 1
                  ? "s"
                  : ""}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={scrollLeft}
                disabled={isAtStart}
                className="hidden md:flex border-muted-foreground bg-white/15 hover:bg-white/30"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={scrollRight}
                disabled={isAtEnd}
                className="hidden md:flex border-muted-foreground bg-white/15 hover:bg-white/30"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="relative">
            <div
              className={cn(
                "absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-300 to-transparent z-10 pointer-events-none hidden md:block transition-opacity duration-300",
                isAtStart ? "opacity-0" : "opacity-100"
              )}
            />
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-4 pb-6"
              onScroll={updateScrollInfo}
            >
              {movies
                .filter((e) => e.type === "movie")
                .map((movie) => (
                  <motion.div
                    key={movie.id}
                    className="flex-none w-[220px] snap-start bg-white/30 rounded-md pb-2"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="relative w-full aspect-[2/3] rounded-t-md overflow-hidden group">
                      <Image
                        src={movie.image || "/placeholder.svg"}
                        alt={`${movie.name} poster`}
                        width={300}
                        height={450}
                        className={cn(
                          "w-full h-full object-cover transition-all duration-300",
                          movie.watched
                            ? "brightness-[0.6]"
                            : "group-hover:brightness-[0.9]"
                        )}
                      />
                      {movie.watched && (
                        <div className="absolute top-2 right-2 bg-white text-black rounded-full p-1 group-hover:opacity-0 transition-opacity duration-300">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                              "h-8 w-8 rounded-full border-white",
                              movie.watched
                                ? "bg-white text-black"
                                : "bg-white/40 text-white hover:bg-white/60 hover:text-white"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWatched(movie);
                            }}
                          >
                            <Check />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-col items-center justify-center max-w-full">
                      <div className="flex items-center gap-2">
                        <h2
                          className={cn(
                            "font-medium text-sm truncate flex-1",
                            movie.watched && movie.dateWatched
                              ? " max-w-[135px]"
                              : " max-w-[200px]"
                          )}
                          title={movie.name}
                        >
                          {movie.name}
                        </h2>
                        {movie.watched && (
                          <span className="inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                            Assistido
                          </span>
                        )}
                      </div>
                      {movie.genres && movie.genres !== "[]" && (
                        <div className="flex flex-wrap gap-1 justify-center mt-1">
                          {JSON.parse(movie.genres)
                            .slice(0, 2)
                            .map((genre) => (
                              <Badge
                                key={genre}
                                variant="outline"
                                className="text-[10px] px-1 py-0 h-4 border-muted-foreground bg-white/5"
                              >
                                {
                                  genres_ids.find((each) => each.id === genre)
                                    ?.name
                                }
                              </Badge>
                            ))}
                          {JSON.parse(movie.genres).length > 2 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{JSON.parse(movie.genres).length - 2}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        Adicionado por:
                        <span className="truncate font-bold">
                          {JSON.parse(movie.addedBy).name}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <CalendarDays className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">
                          {formatDate(movie.date)}
                        </span>
                      </div>
                      {movie.watched && movie.dateWatched && (
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Check className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">
                            Assistido:{" "}
                            <span className="font-bold">
                              {formatDate(movie.dateWatched)}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
            </div>
            <div
              className={cn(
                "absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-300 to-transparent z-10 pointer-events-none hidden md:block transition-opacity duration-300",
                isAtEnd ? "opacity-0" : "opacity-100"
              )}
            />
          </div>

          {/* TV Shows Section */}
          <div className="flex items-center justify-between mb-4 mt-6">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Séries</h1>
              <Badge
                variant="outline"
                className="border-muted-foreground bg-white/15"
              >
                {movies.filter((each) => each.type === "tv").length} série
                {movies.filter((each) => each.type === "tv").length !== 1
                  ? "s"
                  : ""}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={scrollTvLeft}
                disabled={tvIsAtStart}
                className="hidden md:flex border-muted-foreground bg-white/15 hover:bg-white/30"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={scrollTvRight}
                disabled={tvIsAtEnd}
                className="hidden md:flex border-muted-foreground bg-white/15 hover:bg-white/30"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="relative">
            <div
              className={cn(
                "absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-300 to-transparent z-10 pointer-events-none hidden md:block transition-opacity duration-300",
                tvIsAtStart ? "opacity-0" : "opacity-100"
              )}
            />
            <div
              ref={tvScrollContainerRef}
              className="flex overflow-x-auto gap-4 pb-6"
              onScroll={updateScrollInfo}
            >
              {movies
                .filter((e) => e.type === "tv")
                .map((movie) => (
                  <motion.div
                    key={movie.id}
                    className="flex-none w-[220px] snap-start bg-white/30 rounded-md pb-2"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="relative w-full aspect-[2/3] rounded-t-md overflow-hidden group">
                      <Image
                        src={movie.image || "/placeholder.svg"}
                        alt={`${movie.name} poster`}
                        width={300}
                        height={450}
                        className={cn(
                          "w-full h-full object-cover transition-all duration-300",
                          movie.watched
                            ? "brightness-[0.6]"
                            : "group-hover:brightness-[0.9]"
                        )}
                      />
                      {movie.watched && (
                        <div className="absolute top-2 right-2 bg-white text-black rounded-full p-1 group-hover:opacity-0 transition-opacity duration-300">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                              "h-8 w-8 rounded-full border-white",
                              movie.watched
                                ? "bg-white text-black"
                                : "bg-white/40 text-white hover:bg-white/60 hover:text-white"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWatched(movie);
                            }}
                          >
                            <Check />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-col items-center justify-center max-w-full">
                      <div className="flex items-center gap-2">
                        <h2
                          className={cn(
                            "font-medium text-sm truncate flex-1",
                            movie.watched && movie.dateWatched
                              ? " max-w-[135px]"
                              : " max-w-[200px]"
                          )}
                          title={movie.name}
                        >
                          {movie.name}
                        </h2>
                        {movie.watched && (
                          <span className="inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                            Assistido
                          </span>
                        )}
                      </div>
                      {movie.genres && movie.genres !== "[]" && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {JSON.parse(movie.genres)
                            .slice(0, 2)
                            .map((genre) => (
                              <Badge
                                key={genre}
                                variant="outline"
                                className="text-[10px] px-1 py-0 h-4 border-muted-foreground bg-white/5"
                              >
                                {
                                  genres_ids.find((each) => each.id === genre)
                                    ?.name
                                }
                              </Badge>
                            ))}
                          {JSON.parse(movie.genres).length > 2 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{JSON.parse(movie.genres).length - 2}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        Adicionado por:
                        <span className="truncate font-bold">
                          {JSON.parse(movie.addedBy).name}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <CalendarDays className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">
                          {formatDate(movie.date)}
                        </span>
                      </div>
                      {movie.watched && movie.dateWatched && (
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Check className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">
                            Assistido:{" "}
                            <span className="font-bold">
                              {formatDate(movie.dateWatched)}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
            </div>
            <div
              className={cn(
                "absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-300 to-transparent z-10 pointer-events-none hidden md:block transition-opacity duration-300",
                tvIsAtEnd ? "opacity-0" : "opacity-100"
              )}
            />
          </div>
        </div>
      </div>

      {/* Add button */}
      <Button
        className="fixed bottom-6 right-6 bg-sky-500 h-12 w-12 rounded-full shadow-lg"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Shuffle Animation Dialog */}
      <Dialog open={isRandomItemOpen} onOpenChange={setIsRandomItemOpen}>
        <DialogContent className="max-w-[400px] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <motion.div
                animate={isShuffling ? { rotate: 360 } : { rotate: 0 }}
                transition={{
                  duration: 0.5,
                  repeat: isShuffling ? Number.POSITIVE_INFINITY : 0,
                  ease: "linear",
                }}
              >
                <Shuffle className="h-5 w-5" />
              </motion.div>
              {isShuffling ? "Sorteando..." : "Filme/Série Sorteado"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 min-h-[400px] justify-center">
            <AnimatePresence mode="wait">
              {isShuffling && shuffleItems.length > 0 ? (
                <motion.div
                  key={`shuffle-${currentShuffleIndex}`}
                  initial={{ rotateY: 90, scale: 0.8 }}
                  animate={{ rotateY: 0, scale: 1 }}
                  exit={{ rotateY: -90, scale: 0.8 }}
                  transition={{ duration: 0.1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="relative">
                    <Image
                      src={
                        shuffleItems[currentShuffleIndex]?.image ||
                        "/placeholder.svg?height=225&width=150"
                      }
                      alt={shuffleItems[currentShuffleIndex]?.name || ""}
                      width={150}
                      height={225}
                      className="rounded-md object-cover"
                    />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-md"
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{
                        duration: 0.2,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                    />
                  </div>
                  <div className="text-lg font-bold text-center">
                    {shuffleItems[currentShuffleIndex]?.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {shuffleItems[currentShuffleIndex]?.type === "movie"
                      ? "Filme"
                      : "Série"}
                  </div>
                </motion.div>
              ) : randomItem ? (
                <motion.div
                  key="final-result"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.2,
                  }}
                  className="flex flex-col items-center gap-4"
                >
                  <motion.div
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(59, 130, 246, 0.7)",
                        "0 0 0 10px rgba(59, 130, 246, 0)",
                        "0 0 0 0 rgba(59, 130, 246, 0)",
                      ],
                    }}
                    transition={{ duration: 1.5, repeat: 2 }}
                    className="rounded-md"
                  >
                    <Image
                      src={randomItem.image || "/placeholder.svg"}
                      alt={randomItem.name}
                      width={150}
                      height={225}
                      className="rounded-md object-cover"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-lg font-bold text-center"
                  >
                    {randomItem.name}
                  </motion.div>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-sm text-muted-foreground"
                  >
                    {randomItem.type === "movie" ? "Filme" : "Série"}
                  </motion.div>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="flex gap-2 flex-wrap justify-center"
                  >
                    {randomItem.genres &&
                      JSON.parse(randomItem.genres)
                        .slice(0, 3)
                        .map((genre) => (
                          <Badge
                            key={genre}
                            variant="outline"
                            className="text-xs"
                          >
                            {genres_ids.find((each) => each.id === genre)?.name}
                          </Badge>
                        ))}
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-muted-foreground py-8"
                >
                  Nenhum item não assistido para sortear!
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <DialogFooter className="flex flex-row gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsRandomItemOpen(false)}
              className="flex items-center gap-1"
              disabled={isShuffling}
            >
              <X className="h-4 w-4" /> Fechar
            </Button>
            {randomItem && !isShuffling && (
              <Button
                variant="default"
                onClick={getRandomFromList}
                className="flex items-center gap-1"
              >
                <Shuffle className="h-4 w-4" /> Sortear novamente
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
