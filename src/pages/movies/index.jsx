// IMPORTANT TO DO: ADD SKELETON TO MAKE LOADING ANIMATION

import React, { useState } from "react";

import { api } from "@/utils";
import { prisma } from "@/lib/database";

import { format, setDefaultOptions } from "date-fns";

import { Section } from "../../components";
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
    watched: false,
    date: new Date(),
    dateWatched: new Date(),
    error: false,
  });

  setDefaultOptions({ locale: ptBR });

  const saveItem = async () => {
    if (configs.image) {
      if (configs.type === "edit") {
        api
          .put(`/movie/${configs.id}`, {
            id: configs.id,
            name: configs.name,
            image: configs.image,
            date: new Date(configs.date),
            watched: configs.watched,
            dateWatched: new Date(configs.dateWatched),
          })
          .then((res) => {
            setMovies(
              movies.map((each) => (each.id === configs.id ? res.data : each))
            );
            setConfigs({
              name: "",
              image: "",
              watched: false,
              date: new Date(),
              dateWatched: new Date(),
            });
          });
      } else {
        api
          .post("/movie", {
            name: configs.name,
            image: configs.image,
            date: new Date(configs.date),
            watched: configs.watched,
            dateWatched: new Date(configs.dateWatched),
          })
          .then((res) => {
            setMovies([...movies, res.data]);
            setConfigs({
              name: "",
              image: "",
              watched: false,
              date: new Date(),
              dateWatched: new Date(),
            });
          });
      }
    } else {
      if (configs.name == "" || configs.name == undefined) return;

      api
        .get(
          `/movie/search?name=${configs.name
            .replace(/\((\d{4})\)/, "")
            .toLowerCase()}&year=${configs.year}`
        )
        .then((res) => {
          setConfigs({
            ...configs,
            error: res.data.Response == "False" ? true : false,
            image: res.data.Poster,
            name: res.data.Title,
          });
        });
    }
  };

  return (
    <Drawer
      onClose={() => {
        setConfigs({
          name: "",
          image: "",
          watched: false,
          date: new Date(),
          dateWatched: new Date(),
        });
      }}
      className="w-full"
    >
      <div
        onClick={() => {
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
              <div className="w-full">
                <Input
                  placeholder="Filme"
                  value={configs.name}
                  error={configs.error}
                  errorMessage={configs.watched ? "" : "Filme não encontrado"}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      saveItem();
                    }
                  }}
                  onChange={(e) => {
                    const name = e.target.value;
                    const yearMatch = name.match(/\((\d{4})\)/);

                    setConfigs({
                      ...configs,
                      name: e.target.value,
                      image: "",
                      year: yearMatch ? yearMatch[1] : undefined,
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
                      setConfigs({ ...configs, dateWatched: e });
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
            {configs.image ? (
              <div className="flex-col left-0  -top-[350px] absolute text-white bg-black/50 h-full w-full flex items-center justify-center ">
                <img
                  src={configs.image}
                  alt="Imagem do filme"
                  className="w-[200px] h-auto rounded-lg"
                />

                <div className="uppercase flex items-start justify-center gap-2 text-lg text-center mt-2 ">
                  <div
                    className={`font-bold ${
                      configs.type === "edit" ? "max-w-screen" : "max-w-[15ch]"
                    } truncate`}
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
            <Button onClick={saveItem} variant="movie" className="w-full">
              {configs.image ? "Salvar" : "Pesquisar"}
            </Button>
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
                    <DrawerTrigger asChild>
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
                        className="transition max-w-[200px] h-[250px] relative cursor-pointer flex flex-col md:h-full overflow-hidden items-center pb-4 rounded-md bg-white hover:bg-pink-300 "
                      >
                        {movie.image ? (
                          <img
                            src={movie.image}
                            alt={movie.name}
                            className="w-[200px] h-[250px] rounded-t-md object-cover"
                          />
                        ) : (
                          <div className="w-[200px] h-[1000px] flex-col gap-2 bg-pink-50 flex items-center justify-center rounded-t-md object-cover">
                            <ImageOff className="text-neutral-400 text-9xl" />
                            <div className="text-xs text-center text-neutral-500">
                              Imagem não encontrada
                            </div>
                          </div>
                        )}
                        <div className="font-bold p-4 text-center truncate">
                          {movie.name}
                        </div>
                        <div className="text-xs text-neutral-500 flex items-center justify-center text-center px-4 w-full">
                          {format(movie.date, "PPP")}
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
              <GalleryDiv galleryItemsAspectRatio="video">
                {movies
                  .filter((each) => each.watched === true)
                  .map((movie, i) => (
                    <DrawerTrigger asChild>
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
                        className="transition w-[200px] relative cursor-pointer flex flex-col md:h-full overflow-hidden items-center pb-4 rounded-md bg-white hover:bg-pink-300 "
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
                        <div className="font-bold p-4 text-center max-w-[150px] truncate">
                          {movie.name}
                        </div>
                        <div className="text-xs text-neutral-500 flex items-center justify-center text-center px-4 w-full">
                          {format(movie.date, "PPP")}
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
