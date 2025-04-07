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
  Trash2,
  X,
  Pencil,
  Clapperboard,
  Tv,
  MoveLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  DrawerClose,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
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
import { format, setDefaultOptions } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMediaQuery } from "@/hooks/use-mobile";

import { api } from "@/utils";
import { prisma } from "@/lib/database";
import Head from "next/head";

import { LoadingScreen } from "../../components";

export const getServerSideProps = async () => {
  const movies = await prisma.movies.findMany({
    orderBy: [
      {
        date: "desc",
      },
    ],
  });

  const serialized = JSON.parse(JSON.stringify(movies));

  return {
    props: {
      rawMovies: serialized,
    },
  };
};

/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
export default function MovieCarousel({ rawMovies }) {
  const [allMovies, setAllMovies] = useState(rawMovies);
  const [pageUnload, setPageUnload] = useState(false);
  const scrollContainerRef = useRef(null);
  const tvScrollContainerRef = useRef(null);
  const searchResultsRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [tvScrollPosition, setTvScrollPosition] = useState(0);
  const [tvMaxScroll, setTvMaxScroll] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isWatched, setIsWatched] = useState(false);
  const [dateWatched, setDateWatched] = useState(new Date());
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [editSearchQuery, setEditSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("movie");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mainSearchQuery, setMainSearchQuery] = useState("");
  const [filterByGenre, setFilterByGenre] = useState(null);
  const [filterByUser, setFilterByUser] = useState(null);
  const [filterByDate, setFilterByDate] = useState(null);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);

  const [configs, setConfigs] = useState({
    timeout: null,
  });
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    api.get("/users").then((res) => {
      setUsers(res.data);
    });
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
      setUser(user);
    } else {
      window.location.href = "/";
    }
  }, []);

  // Make format is pt
  setDefaultOptions({ locale: ptBR });

  // Check if the device is mobile
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Filter movies and TV shows

  const movies = allMovies
    .filter((movie) => {
      // Filter by search query
      if (
        mainSearchQuery &&
        !movie.name.toLowerCase().includes(mainSearchQuery.toLowerCase())
      ) {
        return false;
      }
      // Filter by genre
      if (filterByGenre && !movie.genres.includes(filterByGenre)) {
        return false;
      }
      // Filter by user
      if (filterByUser && movie.addedBy !== filterByUser) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Sort by watched status: watched movies go last
      if (a.watched && !b.watched) return 1;
      if (!a.watched && b.watched) return -1;
      // Sort by date (most recent first)
      return new Date(b.date) - new Date(a.date);
    });

  // Get unique genres, users, and dates for filters
  const allGenres = Array.from(
    new Set(allMovies.flatMap((movie) => JSON.parse(movie.genres)))
  );
  const allUsers = Array.from(new Set(allMovies.map((movie) => movie.addedBy)));

  // Count movies by user
  const moviesByUser = allUsers.reduce((acc, user) => {
    acc[user] = allMovies.filter((movie) => movie.addedBy === user).length;
    return acc;
  }, {});

  // Genres IDS
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
    { name: "Ação e Aventura", id: 10759 },
    { name: "Animação", id: 16 },
    { name: "Comédia", id: 35 },
    { name: "Crime", id: 80 },
    { name: "Documentário", id: 99 },
    { name: "Drama", id: 18 },
    { name: "Família", id: 10751 },
    { name: "Infantil", id: 10762 },
    { name: "Mistério", id: 9648 },
    { name: "Notícias", id: 10763 },
    { name: "Reality Show", id: 10764 },
    { name: "Ficção Científica e Fantasia", id: 10765 },
    { name: "Novela", id: 10766 },
    { name: "Talk Show", id: 10767 },
    { name: "Guerra e Política", id: 10768 },
    { name: "Faroeste", id: 37 },
  ];

  // Get search results for both modes
  const searchMovie = ({ name, year }) => {
    api
      .get(
        `/movie/search?name=${name
          .replace(/\((\d{4})\)/, "")
          .toLowerCase()}&year=${year}&type=${searchType}`
      )
      .then((res) => {
        setSearchResults(res.data);
      });
  };

  //   const editSearchResults = getSearchResults(editSearchQuery);

  // Calculate if at start or end based on scroll position
  const isAtStart = scrollPosition <= 10;
  const isAtEnd = scrollPosition >= maxScroll - 10;

  const tvIsAtStart = tvScrollPosition <= 10;
  const tvIsAtEnd = tvScrollPosition >= tvMaxScroll - 10;

  // Update scroll position and max scroll values
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

  // Initialize scroll position check
  useEffect(() => {
    // Initial update after render
    const timer = setTimeout(() => {
      updateScrollInfo();
    }, 100);

    // Add resize listener to recheck positions when window size changes
    window.addEventListener("resize", updateScrollInfo);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateScrollInfo);
    };
  }, []);

  // Update scroll info when movies change
  useEffect(() => {
    updateScrollInfo();
  }, [movies]);

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

  // Update the watched status
  const toggleWatched = () => {
    setIsWatched((prev) => {
      const newWatched = !prev;
      if (isEditMode === true) {
        setEditingMovie((prevMovie) => ({
          ...prevMovie,
          watched: newWatched,
        }));
      }
      return newWatched;
    });
  };

  // Update the dateWatched
  const updateDateWatched = (date) => {
    setDateWatched(date);
    if (isEditMode === true) {
      setEditingMovie((prevMovie) => ({
        ...prevMovie,
        dateWatched: date,
      }));
    }
  };

  // Open dialog/drawer in edit mode
  const handleEditMovie = (movie) => {
    setIsEditMode(true);
    setIsWatched(movie.watched);
    setDateWatched(movie.dateWatched);

    setEditSearchQuery("");
    setOpen(true);
    setEditingMovie({
      id: movie.id,
      name: movie.name,
      image: movie.image,
      genres: movie.genres,
      providers: movie.providers,
      date: new Date(movie.date),
      watched: movie.watched,
      dateWatched: new Date(movie.dateWatched),
      type: movie.type,
      addedBy: movie.addedBy,
    });
  };

  // Handle movie selection in the dialog/drawer
  const handleSelectMovie = (movie) => {
    api
      .get(`/movie/search/providers?id=${movie.id}&type=${searchType}`)
      .then((res) => {
        setSelectedMovie({
          id: movie.id,
          name: searchType === "movie" ? movie.title : movie.name,
          image: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          genres: movie.genre_ids,
          providers: res.data.providers,
          date: new Date(movie.release_date),
          watched: movie.watched || isWatched,
          dateWatched: new Date(movie.dateWatched || new Date()),
          type: searchType,
          addedBy: user,
        });

        if (isEditMode === true) {
          setEditingMovie({
            ...editingMovie,
            name: searchType === "movie" ? movie.title : movie.name,
            image: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            genres: JSON.stringify(movie.genre_ids),
            providers: JSON.stringify(res.data.providers),
            date: new Date(movie.release_date),
            watched: movie.watched,
            dateWatched: new Date(movie.dateWatched || new Date()),
            type: searchType,
            addedBy: JSON.stringify(user),
          });
        }
      });
  };

  // Handle adding or updating a movie
  const handleAddMovie = () => {
    if (isEditMode) {
      if (!editingMovie.id || !editingMovie.name) return;

      api
        .put(`/movie/${editingMovie.id}`, {
          id: editingMovie.id,
          name: editingMovie.name,
          image: editingMovie.image,
          providers: editingMovie.providers,
          genres: editingMovie.genres,
          date: new Date(editingMovie.date),
          watched: editingMovie.watched,
          dateWatched: new Date(editingMovie.dateWatched),
        })
        .then((res) => {
          setAllMovies(
            allMovies.map((each) =>
              each.id === editingMovie.id ? res.data : each
            )
          );
          // Reset form
          setSearchType("movie");
          setSearchQuery("");
          setSelectedMovie(null);
          setIsWatched(false);
          setDateWatched(new Date());
          setIsEditMode(false);
          setEditingMovie(null);
          setEditSearchQuery("");
          setOpen(false);
        });
    } else {
      if (!selectedMovie.image || !selectedMovie.name) return;
      api
        .post("/movie", {
          name: selectedMovie.name,
          image: selectedMovie.image,
          providers: JSON.stringify(selectedMovie.providers),
          genres: JSON.stringify(selectedMovie.genres),
          date: new Date(),
          watched: selectedMovie.watched || isWatched,
          dateWatched: dateWatched ? new Date(dateWatched) : new Date(),
          type: selectedMovie.type,
          addedBy: JSON.stringify(selectedMovie.addedBy),
        })
        .then((res) => {
          setAllMovies([res.data, ...allMovies]);
          setOpen(false);
          //   Reset form
          setSearchQuery("");
          setSearchType("movie");
          setSelectedMovie(null);
          setIsWatched(false);
          setDateWatched(new Date());
          setIsEditMode(false);
          setEditingMovie(null);
          setEditSearchQuery("");
        });
    }
  };

  // Handle deleting a movie
  const handleDeleteMovie = () => {
    api.delete(`/movie/${editingMovie?.id}`).then(() => {
      setAllMovies(allMovies.filter((each) => each.id !== editingMovie?.id));
      setOpen(false);
      // Reset form
      setSearchQuery("");
      setSearchType("movie");
      setSelectedMovie(null);
      setIsWatched(false);
      setDateWatched(new Date());
      setIsEditMode(false);
      setEditingMovie(null);
      setEditSearchQuery("");
    });
  };

  // Reset form when dialog/drawer is closed
  const handleDialogClose = (open) => {
    setOpen(open);
    if (!open) {
      setSearchType("movie");
      setSearchQuery("");
      setSelectedMovie(null);
      setIsWatched(false);
      setDateWatched(new Date());
      setIsEditMode(false);
      setEditingMovie(null);
      setEditSearchQuery("");
    }
  };

  // Handle filter changes
  const handleFilterChange = (type, value) => {
    switch (type) {
      case "genre":
        setFilterByGenre(value === filterByGenre ? null : value);
        break;
      case "user":
        setFilterByUser(value === filterByUser ? null : value);
        break;
      case "date":
        setFilterByDate(value === filterByDate ? null : value);
        break;
      case "clear":
        setFilterByGenre(null);
        setFilterByUser(null);
        setFilterByDate(null);
        setMainSearchQuery("");
        break;
    }
  };

  // Content for edit mode
  const editContent = (
    <div className="space-y-6 pt-4 max-w-[375px] md:max-w-[700px]">
      {/* Search input for edit mode - now searches for new movies */}
      <div className="relative w-full flex items-center gap-2 md:gap-0 justify-center">
        <div className="w-11/12 md:w-11/12">
          <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={`Procurar ${
              searchType === "movie" ? "filme" : "série"
            }...`}
            className="pl-8 w-full -mt-[1.0rem]"
            value={editSearchQuery}
            onChange={(e) => {
              if (configs.timeout) clearTimeout(configs.timeout);
              const name = e.target.value;
              const yearMatch = name.match(/\((\d{4})\)/);
              const timeout = setTimeout(() => {
                searchMovie({
                  name: e.target.value,
                  year: yearMatch ? yearMatch[1] : undefined,
                });
              }, 500);
              setConfigs({
                ...configs,
                timeout: timeout,
              });
              setEditSearchQuery(e.target.value);
            }}
          />
        </div>
        <div className="flex flex-col items-center justify-end w-1/12 md:w-1/12">
          <Button
            size="icon"
            variant="outline"
            onClick={() =>
              setSearchType(searchType === "movie" ? "tv" : "movie")
            }
          >
            {searchType === "movie" ? (
              <Clapperboard className="h-4 w-4" />
            ) : (
              <Tv className="h-4 w-4" />
            )}
          </Button>
          <div className="text-xs text-center">
            {searchType === "movie" ? "Filmes" : "Séries"}
          </div>
        </div>
      </div>

      {/* Edit search results - now shows external movies */}
      <div className="md:overflow-y-auto md:mt-2 md:max-h-[450px] md:pr-4">
        {editSearchQuery.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Resultados</h3>
            {searchResults.length > 0 ? (
              <div
                ref={searchResultsRef}
                className="flex overflow-x-auto gap-1"
                //   style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {searchResults.map((movie) => (
                  <div
                    key={movie.id}
                    className={cn(
                      "flex-none w-[160px] h-min cursor-pointer rounded-md m-2",
                      selectedMovie?.id === movie.id
                        ? "ring-2 ring-primary"
                        : ""
                    )}
                    onClick={() => {
                      handleSelectMovie(movie);
                    }}
                  >
                    <div className="relative w-full aspect-[2/3] overflow-hidden">
                      <Image
                        src={
                          movie.poster_path
                            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                            : "/no-image-avaible.jpg"
                        }
                        alt={searchType === "movie" ? movie.title : movie.name}
                        width={500}
                        height={500}
                        className={cn(
                          "w-full h-full rounded-t",
                          movie.poster_path
                            ? "object-cover"
                            : "opacity-50 object-cover scale-105"
                        )}
                      />
                    </div>
                    <div className="p-2">
                      <h4
                        className="font-medium text-sm truncate"
                        title={
                          searchType === "movie" ? movie.title : movie.name
                        }
                      >
                        {searchType === "movie" ? movie.title : movie.name}
                      </h4>
                      <p className="text-xs truncate max-w-full text-muted-foreground">
                        {movie.release_date
                          ? format(new Date(movie.release_date), "PPP")
                          : "Sem data"}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {movie.genre_ids?.slice(0, 2).map((genre) => (
                          <Badge
                            key={genre}
                            variant="outline"
                            className="text-[10px] px-1 py-0 h-4"
                          >
                            {
                              genres_ids?.find((each) => each.id === genre)
                                ?.name
                            }
                          </Badge>
                        ))}
                        {movie.genre_ids?.length > 2 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{movie.genre_ids.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No results found</p>
            )}
          </div>
        )}
        {editingMovie && !editSearchQuery && (
          <div className="flex gap-4">
            <div className="w-[100px] h-[150px] flex-shrink-0 rounded-md overflow-hidden">
              <Image
                src={editingMovie.image || "/no-image-avaible.jpg"}
                alt={editingMovie.name}
                width={100}
                height={150}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-medium truncate max-w-full">
                {editingMovie.name}
              </h3>
              <div className="flex flex-wrap gap-1 mt-2">
                {editingMovie.genres &&
                  editingMovie.genres !== "[]" &&
                  Array.isArray(JSON.parse(editingMovie.genres)) &&
                  JSON.parse(editingMovie.genres).map((genre) => (
                    <Badge key={genre} variant="outline" className="text-xs">
                      {genres_ids.find((each) => each.id === genre)?.name}
                    </Badge>
                  ))}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Adicionado em: {format(editingMovie.date, "PPP")}
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                Adicionado por:
                <div>
                  {editingMovie.addedBy ? (
                    <div className="flex gap-1 items-center">
                      <Image
                        src={`https://cdn.discordapp.com/avatars/${
                          JSON.parse(editingMovie.addedBy).id
                        }/${
                          users.length > 0
                            ? users.find(
                                (u) =>
                                  u.id === JSON.parse(editingMovie.addedBy).id
                              ).avatar
                            : JSON.parse(editingMovie.addedBy).avatar
                        }.png`}
                        width={512}
                        height={512}
                        className="w-6 h-6 rounded-full"
                        alt={JSON.parse(editingMovie.addedBy).name}
                      />
                      <div className="text-xs font-bold">
                        {users.length > 0
                          ? users.find(
                              (u) =>
                                u.id === JSON.parse(editingMovie.addedBy).id
                            ).name
                          : JSON.parse(editingMovie.addedBy).name}
                      </div>
                    </div>
                  ) : (
                    "Sem nome"
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {editingMovie && (
          <div className="space-y-4 border-t pt-4 mt-2">
            <h3 className="text-sm font-medium">
              Status {searchType === "movie" ? "do filme" : "da série"}
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant={isWatched ? "default" : "outline"}
                size="sm"
                onClick={toggleWatched}
                className="flex items-center gap-1"
              >
                <Check
                  className={cn(
                    "h-4 w-4",
                    isWatched
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  )}
                />
                {isWatched ? "Assistido" : "Marcar como assistido"}
              </Button>
              {isWatched && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <CalendarDays className="h-4 w-4 mr-1" />
                      {dateWatched
                        ? format(dateWatched, "PPP")
                        : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateWatched}
                      onSelect={updateDateWatched}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button onClick={handleAddMovie} className="flex-1">
          Salvar
        </Button>
        {!editSearchQuery.length > 0 && (
          <Button
            variant="destructive"
            size="icon"
            onClick={() => {
              setDeleteDialogOpen(true);
              setEditingMovie(editingMovie);
            }}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">
              Apagar {searchType === "movie" ? "filme" : "série"}
            </span>
          </Button>
        )}
      </div>
    </div>
  );

  // Content for both dialog and drawer
  const searchContent = (
    <div className="space-y-6 pt-4 max-w-[360px] md:max-w-[700px]">
      <div>
        <div className="relative w-full flex items-center md:gap-0 gap-2 justify-center">
          <div className="w-11/12">
            <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={`Procurar ${
                searchType === "movie" ? "filme" : "série"
              }...`}
              className="pl-8 w-full -mt-[1.0rem]"
              value={searchQuery}
              onChange={(e) => {
                if (configs.timeout) clearTimeout(configs.timeout);
                const name = e.target.value;
                const yearMatch = name.match(/\((\d{4})\)/);
                const timeout = setTimeout(() => {
                  searchMovie({
                    name: e.target.value,
                    year: yearMatch ? yearMatch[1] : undefined,
                  });
                }, 500);
                setConfigs({
                  ...configs,
                  timeout: timeout,
                });
                setSearchQuery(e.target.value);
              }}
            />
          </div>
          <div className="flex flex-col items-center justify-center w-1/12">
            <Button
              size="icon"
              variant="outline"
              onClick={() =>
                setSearchType(searchType === "movie" ? "tv" : "movie")
              }
            >
              {searchType === "movie" ? (
                <Clapperboard className="h-4 w-4" />
              ) : (
                <Tv className="h-4 w-4" />
              )}
            </Button>
            <div className="text-xs text-center">
              {searchType === "movie" ? "Filmes" : "Séries"}
            </div>
          </div>
        </div>
        <div className="overflow-y-auto md:mt-2 md:max-h-[450px] md:pr-4">
          {searchQuery.length > 0 && (
            <div className="space-y-4 mt-2">
              <h3 className="text-sm font-medium">Resultados</h3>
              {searchResults.length > 0 ? (
                <div
                  ref={searchResultsRef}
                  className="flex overflow-x-auto gap-1"
                >
                  {searchResults.map((movie) => (
                    <div
                      key={movie.id}
                      className={cn(
                        "flex-none w-[160px] h-min cursor-pointer rounded-md m-2",
                        selectedMovie?.id === movie.id
                          ? "ring-2 ring-primary"
                          : ""
                      )}
                      onClick={() => handleSelectMovie(movie)}
                    >
                      <div className="relative w-full aspect-[2/3] overflow-hidden">
                        <Image
                          src={
                            movie.poster_path
                              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                              : "/no-image-avaible.jpg"
                          }
                          alt={
                            searchType === "movie" ? movie.title : movie.name
                          }
                          width={500}
                          height={500}
                          className={cn(
                            "w-full h-full rounded-t",
                            movie.poster_path
                              ? "object-cover"
                              : "opacity-50 object-cover scale-105"
                          )}
                        />
                      </div>
                      <div className="p-2">
                        <h4
                          className="font-medium text-sm truncate"
                          title={
                            searchType === "movie" ? movie.title : movie.name
                          }
                        >
                          {searchType === "movie" ? movie.title : movie.name}
                        </h4>
                        {searchType === "movie" && (
                          <p className="text-xs truncate max-w-full text-muted-foreground">
                            {movie.release_date
                              ? format(new Date(movie.release_date), "PPP")
                              : "Sem data"}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {movie.genre_ids?.slice(0, 2).map((genre) => (
                            <Badge
                              key={genre}
                              variant="outline"
                              className="text-[10px] px-1 py-0 h-4"
                            >
                              {
                                genres_ids.find((each) => each.id === genre)
                                  ?.name
                              }
                            </Badge>
                          ))}
                          {movie.genre_ids?.length > 2 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{movie.genre_ids.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum resultado encontrado!
                </p>
              )}
            </div>
          )}
          {selectedMovie && !isEditMode && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-medium">Filme selecionado</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant={isWatched ? "default" : "outline"}
                  size="sm"
                  onClick={toggleWatched}
                  className="flex items-center gap-1"
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      isWatched
                        ? "text-primary-foreground"
                        : "text-muted-foreground"
                    )}
                  />
                  {isWatched ? "Assistido" : "Marcar como assistido"}
                </Button>
                {isWatched && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <CalendarDays className="h-4 w-4 mr-1" />
                        {dateWatched
                          ? format(dateWatched, "PPP")
                          : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateWatched}
                        onSelect={updateDateWatched}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Button variant="movie" onClick={handleAddMovie} className="w-full">
        Adcionar {searchType === "movie" ? "filme" : "série"}
      </Button>
    </div>
  );

  return (
    <div className="">
      <LoadingScreen open={pageUnload} />
      {/* Search and filter bar */}
      <div
        onClick={() => {
          setPageUnload(true);
          window.location.href = "/";
        }}
        className="flex items-center justify-center absolute top-0 gap-2 p-4 group cursor-pointer"
      >
        <MoveLeft className="text-neutral-500 text-2xl" />
        <div className="text-xs mt-0.5 text-neutral-500 uppercase group-hover:underline ">
          voltar
        </div>
      </div>
      <div className="flex flex-col items-center pt-8 justify-start min-h-screen bg-slate-300 text-black">
        <div className="font-logo text-4xl text-neutral-700 mt-1">Filmes</div>
        <div className="text-xs text-neutral-500 mt-2 uppercase">
          {"Lista de filmes para assistir juntinhos!"}
        </div>
        <Head>
          <title>Cafofo Estelar - Lista de filmes</title>
          <meta name="theme_color" content="#cbd5e1" />
          <meta name="theme-color" content="#cbd5e1" />
        </Head>
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
                    <span className="sr-only">Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 max-h-96">
                  <DropdownMenuLabel>Filtrar por:</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                    Gênero
                  </DropdownMenuLabel>
                  {allGenres.map((genre) => (
                    <DropdownMenuItem
                      key={genre}
                      className={cn(filterByGenre === genre && "bg-muted")}
                      onClick={() => handleFilterChange("genre", genre)}
                    >
                      {genres_ids.find((each) => each.id === genre)?.name}
                      {filterByGenre === genre && (
                        <Check className="ml-auto h-4 w-4" />
                      )}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                    Adcionado por
                  </DropdownMenuLabel>
                  {allUsers.map((user) => (
                    <DropdownMenuItem
                      key={user}
                      className={cn(filterByUser === user && "bg-muted")}
                      onClick={() => handleFilterChange("user", user)}
                    >
                      {user ? (
                        <div className="flex gap-2 items-center">
                          <Image
                            src={`https://cdn.discordapp.com/avatars/${
                              JSON.parse(user).id
                            }/${
                              users.length > 0
                                ? users.find(
                                    (u) => u.id === JSON.parse(user).id
                                  ).avatar
                                : JSON.parse(user).avatar
                            }.png`}
                            width={512}
                            height={512}
                            className="w-8 h-8 rounded-full"
                            alt={JSON.parse(user).name}
                          />
                          <div className="text-xs ">
                            {users.length > 0
                              ? users.find((u) => u.id === JSON.parse(user).id)
                                  .name
                              : JSON.parse(user).name}
                          </div>
                        </div>
                      ) : (
                        "Sem nome"
                      )}{" "}
                      ({moviesByUser[user]})
                      {filterByUser === user && (
                        <Check className="ml-auto h-4 w-4" />
                      )}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleFilterChange("clear", null)}
                  >
                    Limpar filtros
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {/* Active filters */}
            {(filterByGenre ||
              filterByUser ||
              filterByDate ||
              mainSearchQuery) && (
              <div className="flex flex-wrap gap-2">
                {mainSearchQuery && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 bg-white/15 border-muted-foreground"
                  >
                    Pesquisa: {mainSearchQuery}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => setMainSearchQuery("")}
                    />
                  </Badge>
                )}
                {filterByGenre && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 bg-white/15 border-muted-foreground"
                  >
                    Gênero: {filterByGenre}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => handleFilterChange("genre", filterByGenre)}
                    />
                  </Badge>
                )}
                {filterByUser && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 bg-white/15 border-muted-foreground"
                  >
                    Adcionado por: {JSON.parse(filterByUser).name}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => ("user", filterByUser)}
                    />
                  </Badge>
                )}
                {filterByDate && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 bg-white/15 border-muted-foreground"
                  >
                    Data: {format(filterByDate, "MMM d, yyyy")}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => handleFilterChange("date", filterByDate)}
                    />
                  </Badge>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Filmes</h1>
              <Badge
                variant="outline"
                className="border-muted-foreground bg-white/15"
              >
                {movies.filter((each) => each.type === "movie").length} filme
                {movies.length > 1 ? "s" : ""}
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
                <span className="sr-only">Scroll left</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={scrollRight}
                disabled={isAtEnd}
                className="hidden md:flex border-muted-foreground bg-white/15 hover:bg-white/30"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Scroll right</span>
              </Button>
            </div>
          </div>
          <div className="relative">
            {/* Left fade gradient with smooth transition */}
            <div
              className={cn(
                "absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none hidden md:block transition-opacity duration-300",
                isAtStart ? "opacity-0" : "opacity-100"
              )}
            ></div>
            {/* Scrollable container */}
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-4 pb-6"
              //   style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              onScroll={updateScrollInfo}
            >
              {movies
                .filter((e) => e.type === "movie")
                .map((movie) => (
                  <div
                    key={movie.id}
                    className="flex-none w-[220px] snap-start bg-white/30 rounded-md pb-2"
                  >
                    {/* Poster with watched indicator */}
                    <div className="relative w-full aspect-[2/3] rounded-t-md overflow-hidden group">
                      <Image
                        src={movie.image || `/no-image-avaible.jpg`}
                        alt={`${
                          searchType === "movie" ? movie.title : movie.name
                        } poster`}
                        width={300}
                        height={450}
                        className={cn(
                          "w-full h-full object-cover transition-all duration-300",
                          movie.watched
                            ? "brightness-[0.6]"
                            : "group-hover:brightness-[0.9]"
                        )}
                      />
                      {/* Watched indicator - hidden on hover */}
                      {movie.watched && (
                        <div className="absolute top-2 right-2 bg-white text-black rounded-full p-1 group-hover:opacity-0 transition-opacity duration-300">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                      {/* Hover overlay with providers */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-white border-white text-black hover:bg-white/40 hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditMovie(movie);
                            }}
                          >
                            <Pencil />
                            <span className="sr-only">Edit movie</span>
                          </Button>
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
                              api
                                .put(`/movie/${movie.id}`, {
                                  id: movie.id,
                                  name: movie.name,
                                  image: movie.image,
                                  providers: movie.providers,
                                  genres: movie.genres,
                                  date: new Date(movie.date),
                                  watched: !movie.watched,
                                  dateWatched: new Date(),
                                  type: movie.type,
                                  addedBy: movie.addedBy,
                                })
                                .then((res) => {
                                  setAllMovies(
                                    allMovies.map((each) =>
                                      each.id === movie.id ? res.data : each
                                    )
                                  );
                                });
                            }}
                          >
                            <Check />
                            <span className="sr-only">
                              {movie.watched
                                ? "Marcar como não assistido"
                                : "Marcar como assistido"}
                            </span>
                          </Button>
                        </div>
                        {movie.providers &&
                          movie.providers !== "[]" &&
                          Array.isArray(JSON.parse(movie.providers)) && (
                            <div className="flex flex-wrap gap-1">
                              {JSON.parse(movie.providers).map((provider) => (
                                <div
                                  key={provider.id}
                                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden"
                                  title={provider.provider_name}
                                >
                                  <Image
                                    src={`https://image.tmdb.org/t/p/w500${provider.logo_path}`}
                                    alt={provider.provider_name}
                                    width={500}
                                    height={500}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    </div>
                    {/* Movie info */}
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
                      {/* Genres */}
                      {movie.genres && movie.genres !== "[]" && (
                        <div className="flex flex-wrap gap-1 justify-center mt-1">
                          {JSON.parse(movie.genres)
                            .slice(0, 2)
                            .map((genre) => (
                              <Badge
                                key={genre}
                                variant="outline"
                                className="text-[10px] px-1 py-0 h-4  border-muted-foreground bg-white/5"
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
                      {/* User who added */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        Adcionado por:
                        <Image
                          src={`https://cdn.discordapp.com/avatars/${
                            JSON.parse(movie.addedBy).id
                          }/${
                            users.length > 0
                              ? users.find(
                                  (u) => u.id === JSON.parse(movie.addedBy).id
                                ).avatar
                              : JSON.parse(movie.addedBy).avatar
                          }.png`}
                          width={512}
                          height={512}
                          className="w-4 h-4 rounded-full"
                          alt={JSON.parse(movie.addedBy).name}
                        />
                        <span className="truncate font-bold">
                          {users.length > 0
                            ? users.find(
                                (u) => u.id === JSON.parse(movie.addedBy).id
                              ).name
                            : JSON.parse(movie.addedBy).name}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <CalendarDays className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">
                          {format(movie.date, "PPP")}
                        </span>
                      </div>
                      {/* Date watched (only for watched movies) */}
                      {movie.watched && movie.dateWatched && (
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Check className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">
                            Assistido:{" "}
                            <span className="font-bold">
                              {format(movie.dateWatched, "dd/MM/yyyy")}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
            {/* Right fade gradient with smooth transition */}
            <div
              className={cn(
                "absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none hidden md:block transition-opacity duration-300",
                isAtEnd ? "opacity-0" : "opacity-100"
              )}
            ></div>
          </div>
          <div className="flex items-center justify-between mb-4 mt-6">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Séries</h1>
              <Badge
                variant="outline"
                className=" border-muted-foreground bg-white/15"
              >
                {movies.filter((each) => each.type === "tv").length} série
                {movies.filter((each) => each.type === "tv").length > 1
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
                <span className="sr-only">Scroll left</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={scrollTvRight}
                disabled={tvIsAtEnd}
                className="hidden md:flex border-muted-foreground bg-white/15 hover:bg-white/30"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Scroll right</span>
              </Button>
            </div>
          </div>
          <div className="relative">
            {/* Left fade gradient with smooth transition */}
            <div
              className={cn(
                "absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none hidden md:block transition-opacity duration-300",
                tvIsAtStart ? "opacity-0" : "opacity-100"
              )}
            ></div>
            {/* Scrollable container */}
            <div
              ref={tvScrollContainerRef}
              className="flex overflow-x-auto gap-4 pb-6 "
              //   style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              onScroll={updateScrollInfo}
            >
              {movies
                .filter((e) => e.type === "tv")
                .map((movie) => (
                  <div
                    key={movie.id}
                    className="flex-none w-[220px] snap-start bg-white/30 rounded-md pb-2"
                  >
                    {/* Poster with watched indicator */}
                    <div className="relative w-full aspect-[2/3] rounded-t-md overflow-hidden group">
                      <Image
                        src={movie.image || `/no-image-avaible.jpg`}
                        alt={`${
                          searchType === "movie" ? movie.title : movie.name
                        } poster`}
                        width={300}
                        height={450}
                        className={cn(
                          "w-full h-full object-cover transition-all duration-300",
                          movie.watched
                            ? "brightness-[0.6]"
                            : "group-hover:brightness-[0.9]"
                        )}
                      />
                      {/* Watched indicator - hidden on hover */}
                      {movie.watched && (
                        <div className="absolute top-2 right-2 bg-white text-black rounded-full p-1 group-hover:opacity-0 transition-opacity duration-300">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                      {/* Hover overlay with providers */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-white border-white text-black hover:bg-white/40 hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditMovie(movie);
                            }}
                          >
                            <Pencil />
                            <span className="sr-only">Edit movie</span>
                          </Button>
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
                              api
                                .put(`/movie/${movie.id}`, {
                                  id: movie.id,
                                  name: movie.name,
                                  image: movie.image,
                                  providers: movie.providers,
                                  genres: movie.genres,
                                  date: new Date(movie.date),
                                  watched: !movie.watched,
                                  dateWatched: new Date(movie.dateWatched),
                                  type: movie.type,
                                  addedBy: movie.addedBy,
                                })
                                .then((res) => {
                                  setAllMovies(
                                    allMovies.map((each) =>
                                      each.id === movie.id ? res.data : each
                                    )
                                  );
                                });
                            }}
                          >
                            <Check />
                            <span className="sr-only">
                              {movie.watched
                                ? "Marcar como não assistido"
                                : "Marcar como assistido"}
                            </span>
                          </Button>
                        </div>
                        {movie.providers &&
                          movie.providers !== "[]" &&
                          Array.isArray(JSON.parse(movie.providers)) && (
                            <div className="flex flex-wrap gap-1">
                              {JSON.parse(movie.providers).map((provider) => (
                                <div
                                  key={provider.id}
                                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden"
                                  title={provider.provider_name}
                                >
                                  <Image
                                    src={`https://image.tmdb.org/t/p/w500${provider.logo_path}`}
                                    alt={provider.provider_name}
                                    width={500}
                                    height={500}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    </div>
                    {/* Movie info */}
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
                      {/* Genres */}
                      {movie.genres && movie.genres !== "[]" && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {JSON.parse(movie.genres)
                            .slice(0, 2)
                            .map((genre) => (
                              <Badge
                                key={genre}
                                variant="outline"
                                className="text-[10px] px-1 py-0 h-4  border-muted-foreground bg-white/5  "
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
                      {/* User who added */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        Adcionado por:
                        <Image
                          src={`https://cdn.discordapp.com/avatars/${
                            JSON.parse(movie.addedBy).id
                          }/${
                            users.length > 0
                              ? users.find(
                                  (u) => u.id === JSON.parse(movie.addedBy).id
                                ).avatar
                              : JSON.parse(movie.addedBy).avatar
                          }.png`}
                          width={512}
                          height={512}
                          className="w-4 h-4 rounded-full"
                          alt={JSON.parse(movie.addedBy).name}
                        />
                        <span className="truncate font-bold">
                          {users.length > 0
                            ? users.find(
                                (u) => u.id === JSON.parse(movie.addedBy).id
                              ).name
                            : JSON.parse(movie.addedBy).name}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <CalendarDays className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">
                          {format(movie.date, "PPP")}
                        </span>
                      </div>
                      {/* Date watched (only for watched movies) */}
                      {movie.watched && movie.dateWatched && (
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Check className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">
                            Assistido:{" "}
                            <span className="font-bold">
                              {format(movie.dateWatched, "dd/MM/yyyy")}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
            {/* Right fade gradient with smooth transition */}
            <div
              className={cn(
                "absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none hidden md:block transition-opacity duration-300",
                tvIsAtEnd ? "opacity-0" : "opacity-100"
              )}
            ></div>
          </div>
        </div>
      </div>

      {/* Add button (fixed position) */}
      <Button
        className="fixed bottom-6 right-6 bg-sky-500 h-12 w-12 rounded-full shadow-lg"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">Add movie</span>
      </Button>

      {/* Dialog for desktop */}
      {true && (
        <Dialog open={open} onOpenChange={handleDialogClose}>
          <DialogContent className="max-w-[750px] bg-white">
            <DialogHeader>
              <DialogTitle>
                {isEditMode
                  ? `Editar ${searchType === "movie" ? "filme" : "série"}`
                  : `Adicionar ${searchType === "movie" ? "filme" : "série"}`}
              </DialogTitle>
            </DialogHeader>
            {isEditMode ? editContent : searchContent}
          </DialogContent>
        </Dialog>
      )}

      {/* Drawer for mobile */}
      {false && (
        <Drawer open={open} onOpenChange={handleDialogClose}>
          <DrawerContent className="bg-white outline-none border-none">
            <DrawerHeader className="border-b">
              <DrawerTitle>
                {isEditMode
                  ? `Editar ${searchType === "movie" ? "filme" : "série"}`
                  : `Adicionar ${searchType === "movie" ? "filme" : "série"}`}
              </DrawerTitle>
              <DrawerClose className="absolute right-4 top-4">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DrawerClose>
            </DrawerHeader>
            <div className="px-4 pb-4">
              {isEditMode ? editContent : searchContent}
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="w-full bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza disso?</AlertDialogTitle>
            <AlertDialogDescription>
              Fazer isso irá remover{" "}
              <span className="font-bold">"{editingMovie?.name}"</span> da lista
              de filmes. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMovie}
              className="bg-destructive text-destructive-foreground"
            >
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
