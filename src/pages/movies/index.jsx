import React, { useState } from "react";

import { api } from "@/utils";
import { prisma } from "@/lib/database";

import { format, setDefaultOptions } from "date-fns";

import { Section, LoadingScreen } from "../../components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { OrbitProgress } from "react-loading-indicators";

import Layout from "@/components/layout/Layout";
import GalleryDiv from "@/components/layout/GalleryDiv";

import {
  ImageOff,
  Eye,
  EyeOff,
  CalendarIcon,
  Trash2,
  MoveLeft,
  Plus,
} from "lucide-react";
import { ptBR } from "date-fns/locale";

import Head from "next/head";

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
function Home({ rawMovies }) {
  const [movies, setMovies] = useState(rawMovies);
  const [configs, setConfigs] = useState({
    id: 0,
    name: "",
    image: "",
    year: "",
    providers: [],
    genres: [],
    watched: false,
    date: new Date(),
    dateWatched: new Date(),
    error: false,
    timeout: null,
  });
  const [editedMovie, setEditedMovie] = useState(false);

  const [movieSearch, setMovieSearch] = useState([]);

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

  const [pageUnload, setPageUnload] = useState(false);
  const [loading, setLoading] = useState(false);

  setDefaultOptions({ locale: ptBR });

  const resetState = () => {
    setMovieSearch([]);
    setConfigs({
      name: "",
      image: "",
      providers: [],
      watched: false,
      date: new Date(),
      dateWatched: new Date(),
      error: false,
      timeout: null,
    });
    setEditedMovie(false);
    setLoading(false);
  };

  const saveItem = async () => {
    if (configs.image) {
      setLoading(true);

      if (configs.type === "edit") {
        console.log(editedMovie);
        if (editedMovie === false) return setTimeout(() => resetState(), 1000);

        api
          .put(`/movie/${configs.id}`, {
            id: configs.id,
            name: configs.name,
            image: configs.image,
            providers: JSON.stringify(configs.providers),
            genres: JSON.stringify(configs.genres),
            date: new Date(configs.date),
            watched: configs.watched,
            dateWatched: new Date(configs.dateWatched),
          })
          .then((res) => {
            setMovies(
              movies.map((each) => (each.id === configs.id ? res.data : each))
            );

            setConfigs({
              ...configs,
              lastMovieImage: configs.image,
            });

            setTimeout(() => {
              resetState();
            }, 1000);
          });
      } else {
        api
          .post("/movie", {
            name: configs.name,
            image: configs.image,
            providers: JSON.stringify(configs.providers),
            genres: JSON.stringify(configs.genres),
            date: new Date(configs.date),
            watched: configs.watched,
            dateWatched: new Date(configs.dateWatched),
          })
          .then((res) => {
            setMovies([res.data, ...movies]);

            setTimeout(() => {
              resetState();
            }, 1000);
          });
      }
    }
  };

  const searchMovie = ({ name, year }) => {
    api
      .get(
        `/movie/search?name=${name
          .replace(/\((\d{4})\)/, "")
          .toLowerCase()}&year=${year}`
      )
      .then((res) => {
        setMovieSearch(res.data);

        if (res.data.length > 0) {
          setTimeout(() => {
            document.getElementById("search-input").blur();
          }, 1500);
        }
      });
  };

  return (
    <Drawer onClose={resetState} className="w-full">
      <Head>
        <title>Cafofo Estelar - Lista de filmes</title>
        <meta name="theme_color" content="#cbd5e1" />
        <meta name="theme-color" content="#cbd5e1" />
      </Head>
      <LoadingScreen open={pageUnload} />
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
      <div className="flex flex-col items-center justify-start min-h-screen p-8 pt-16 bg-slate-300 text-black">
        <div className="font-logo text-4xl text-neutral-700 mt-1">Filmes</div>
        <div className="text-xs text-neutral-500 mt-2 uppercase">
          {"Lista de filmes para assistir juntinhos!"}
        </div>

        <div className="fixed z-50 bottom-4 right-4">
          <DrawerTrigger asChild>
            <div className="flex -mt-6 flex-col gap-2 rounded-full items-end w-full">
              <div className="rounded-full flex items-center justify-center text-white bg-sky-500 p-4">
                <Plus />
              </div>
            </div>
          </DrawerTrigger>
        </div>
        <DrawerContent className="bg-white flex flex-col gap-2">
          <DrawerHeader>
            <DrawerTitle>
              {configs.type === "edit" ? "Editar" : "Adicionar"} filme
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex md:flex-col flex-col gap-2 p-4 pb-0">
            <div className="flex gap-2 items-center justify-start flex-grow w-full">
              <div className="w-full relative">
                {movieSearch.length > 0 && (
                  <div className="w-full absolute bottom-10 max-h-[600px] overflow-y-auto bg-neutral-50 rounded b-0 border rounded-b-none border-b-0 border-input m-0">
                    <div>
                      {movieSearch.map((movie, i) => (
                        <div
                          key={i}
                          className="flex even:bg-neutral-200 items-center justify-center gap-2 w-full bg-neutral-50 p-4 pr-4 text-xs text-neutral-400 hover:bg-neutral-100 cursor-pointer"
                          onClick={() => {
                            api
                              .get("/movie/search/providers?id=" + movie.id)
                              .then((res) => {
                                setConfigs({
                                  ...configs,
                                  name: movie.title,
                                  image: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                                  genres: movie.genre_ids,
                                  year: movie.release_date,
                                  providers: res.data.providers,
                                });

                                setEditedMovie(true);

                                setMovieSearch([]);
                              });
                          }}
                        >
                          <div className="flex gap-4 items-center justify-center">
                            <div className="w-full grid place-items-center">
                              {movie.poster_path ? (
                                <img
                                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                  alt={movie.title}
                                  className="w-full h-full rounded-md object-cover"
                                />
                              ) : (
                                <div className="w-auto h-[200px] flex-col gap-2 bg-neutral-50 flex items-center justify-center rounded-md object-cover">
                                  <ImageOff className="text-neutral-400 text-9xl" />
                                  <div className="text-xs text-center text-neutral-500">
                                    Imagem não encontrada
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="w-full grid place-items-center text-black font-bold text-center">
                              <div>{movie.title}</div>
                              <div>
                                {movie.release_date ? (
                                  <div className="text-xs text-neutral-500">
                                    {format(
                                      new Date(movie.release_date),
                                      "PPP"
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-xs text-neutral-500">
                                    Data não encontrada
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center justify-center gap-2 flex-wrap mt-2">
                                {movie.genre_ids.map((genre, i) => (
                                  <div
                                    className="text-xs bg-black text-white px-2 rounded-lg"
                                    key={i}
                                  >
                                    {
                                      genres_ids.find(
                                        (each) => each.id === genre
                                      )?.name
                                    }
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <Input
                  placeholder="Filme"
                  value={configs.name}
                  id="search-input"
                  className={`${
                    configs.name.length > 0 &&
                    movieSearch.length > 0 &&
                    "rounded-t-none border-t-0"
                  }`}
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
                      name: e.target.value,
                      year: yearMatch ? yearMatch[1] : undefined,
                      timeout: timeout,
                    });
                  }}
                />
              </div>
              <div className="flex items-center justify-center relative gap-0 5 flex-col ">
                <div className="text-xs text-center absolute -top-4 ">
                  {configs.watched ? "Assistido" : "Assistir"}
                </div>
                <Button
                  onClick={() =>
                    setConfigs({ ...configs, watched: !configs.watched })
                  }
                  variant={configs.watched ? "movie" : "outline"}
                >
                  {configs.watched ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>
            {configs.watched && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"}>
                    <CalendarIcon />
                    {configs.dateWatched ? (
                      format(configs.dateWatched, "PPP")
                    ) : (
                      <span>Escolha uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={configs.dateWatched}
                    onSelect={(e) => {
                      setEditedMovie(true);
                      setConfigs({ ...configs, dateWatched: e });
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
            {configs.image && movieSearch.length <= 0 ? (
              <div className="flex-col left-0  -top-[350px] absolute text-white bg-black/50 h-full w-full flex items-center justify-center ">
                <img
                  src={configs.image}
                  alt="Imagem do filme"
                  className="w-[200px] h-auto rounded-lg"
                />

                <div className="uppercase flex items-start justify-center gap-1 text-lg text-center mt-2 ">
                  <div
                    className={`font-bold ${
                      configs.type === "edit"
                        ? "sm:max-w-[85%]"
                        : "sm:max-w-[15ch]"
                    } sm:truncate`}
                  >
                    {configs.name}
                  </div>
                  {configs.type !== "edit" && "é o filme correto?"}
                </div>
              </div>
            ) : (
              <div className="w-full flex-grow h-auto text-xs">
                {!configs.error &&
                  !configs.watched &&
                  "Pesquise o nome do filme no campo acima"}
              </div>
            )}
            {configs.type === "edit" && (
              <DrawerClose asChild>
                <Button
                  onClick={() => {
                    api.delete(`/movie/${configs.id}`).then((res) => {
                      setMovies(
                        movies.filter((each) => each.id !== res.data.id)
                      );
                    });
                  }}
                  variant="destructive"
                >
                  <Trash2 />
                  Excluir
                </Button>
              </DrawerClose>
            )}
          </div>
          <DrawerFooter>
            {loading ? (
              <div className="flex items-center justify-center gap-2 w-full">
                <OrbitProgress size="small" color="#0ea5e9" />
              </div>
            ) : (
              <Button
                onClick={saveItem}
                disabled={!configs.image}
                variant="movie"
                className="w-full"
              >
                Salvar
              </Button>
            )}
          </DrawerFooter>
        </DrawerContent>
        <Section title="Lista de filmes para assistir">
          {movies.filter((each) => each.watched === false).length <= 0 ? (
            <div className="text-center text-neutral-400 text-xs uppercase font-bold">
              Nenhum filme para assistir ainda!
            </div>
          ) : (
            <Layout contentMaxWidth={"1080px"}>
              <GalleryDiv galleryItemsAspectRatio="video">
                {movies
                  .filter((each) => each.watched === false)
                  .map((movie, i) => (
                    <DrawerTrigger key={i} asChild>
                      <div
                        onClick={() => {
                          setConfigs({
                            type: "edit",
                            id: movie.id,
                            name: movie.name,
                            image: movie.image,
                            genres: movie.genres,
                            providers: movie.providers,
                            year: movie.year,
                            watched: movie.watched,
                            date: movie.date,
                            dateWatched: movie.dateWatched,
                            error: false,
                          });
                        }}
                        className="transition max-w-[200px] h-full relative cursor-pointer flex flex-col items-center rounded-md bg-white hover:bg-neutral-200 "
                      >
                        {movie.image ? (
                          <img
                            src={movie.image}
                            alt={movie.name}
                            className="w-[200px] h-[250px] rounded-t-md object-cover"
                          />
                        ) : (
                          <div className="w-[200px] h-[1000px] flex-col gap-2 bg-neutral-50 flex items-center justify-center rounded-t-md object-cover">
                            <ImageOff className="text-neutral-400 text-9xl" />
                            <div className="text-xs text-center text-neutral-500">
                              Imagem não encontrada
                            </div>
                          </div>
                        )}
                        <div className="w-full h-full pb-4 flex items-center justify-center flex-col gap-2">
                          <div className="flex items-center flex-col  w-full h-full  text-center justify-start">
                            <div className="font-bold p-4 text-center max-w-[200px] truncate">
                              {movie.name}
                            </div>
                            <div className="text-xs text-neutral-500 flex items-center justify-center text-center -mt-4 px-4 w-full">
                              {format(movie.date, "PPP")}
                            </div>
                          </div>
                          {movie.genres && movie.genres !== "[]" && (
                            <div className="flex items-start h-full  justify-center gap-2 px-2 flex-wrap">
                              {JSON.parse(movie?.genres).map((genre, i) => (
                                <div
                                  className="text-xs bg-black text-white px-2 rounded-lg"
                                  key={i}
                                >
                                  {
                                    genres_ids.find((each) => each.id === genre)
                                      ?.name
                                  }
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="font-bold h-full flex items-end  justify-center text-center w-full text-xs">
                            Onde assistir:
                          </div>
                          <div>
                            {movie.providers && movie.providers !== "[]" ? (
                              <div className="flex items-center justify-center">
                                {JSON.parse(movie.providers).map(
                                  (provider, i) => (
                                    <img
                                      src={`https://image.tmdb.org/t/p/w500${provider.logo_path}`}
                                      alt={provider.provider_name}
                                      title={provider.provider_name}
                                      key={i}
                                      width={50}
                                      height={50}
                                      className="rounded-full object-cover"
                                    />
                                  )
                                )}
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-center font-bold text-neutral-500">
                                {"Sem opções de provedor"}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </DrawerTrigger>
                  ))}
              </GalleryDiv>
            </Layout>
          )}
        </Section>
        <Section title="Lista de filmes assistidos">
          {movies.filter((each) => each.watched === true).length <= 0 ? (
            <div className="text-center text-neutral-400 text-xs uppercase font-bold">
              Nenhum filme assistido ainda!
            </div>
          ) : (
            <Layout contentMaxWidth={"1080px"}>
              <GalleryDiv galleryItemsAspectRatio="square">
                {movies
                  .filter((each) => each.watched === true)
                  .map((movie, i) => (
                    <DrawerTrigger key={i} asChild>
                      <div
                        key={i}
                        onClick={() => {
                          setConfigs({
                            type: "edit",
                            id: movie.id,
                            name: movie.name,
                            image: movie.image,
                            year: movie.year,
                            watched: movie.watched,
                            date: movie.date,
                            dateWatched: movie.dateWatched,
                            error: false,
                          });
                        }}
                        className="transition w-[200px] relative cursor-pointer flex flex-col md:h-full overflow-hidden items-center pb-4 rounded-md bg-white hover:bg-neutral-200 "
                      >
                        {movie.image ? (
                          <img
                            src={movie.image}
                            alt={movie.name}
                            className="w-[200px] h-[250px] rounded-t-md object-cover"
                          />
                        ) : (
                          <div className="w-[200px] h-[250px] flex-col gap-2 bg-pink-50 flex items-center justify-center rounded-t-md object-cover">
                            <ImageOff className="text-neutral-400 text-9xl" />
                            <div className="text-xs text-center text-neutral-500">
                              Imagem não encontrada
                            </div>
                          </div>
                        )}
                        <div className="font-bold p-4 text-center max-w-[200px] truncate">
                          {movie.name}
                        </div>
                        <div className="text-xs text-neutral-500 flex items-center justify-center text-center px-4 w-full">
                          {format(movie.dateWatched, "PPP")}
                        </div>
                      </div>
                    </DrawerTrigger>
                  ))}
              </GalleryDiv>
            </Layout>
          )}
        </Section>
      </div>
    </Drawer>
  );
}

export default Home;
