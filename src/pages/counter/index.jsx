// IMPORTANT TO DO: ADD SKELETON TO MAKE LOADING ANIMATION

import React, { useState } from "react";

import { api } from "@/utils";
import { prisma } from "@/lib/database";

import { format, set, setDefaultOptions } from "date-fns";

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

import { OrbitProgress } from "react-loading-indicators";

import { MoveLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { ptBR } from "date-fns/locale";

import Head from "next/head";

export const getServerSideProps = async () => {
  const counters = await prisma.counters.findMany({
    orderBy: [
      {
        date: "desc",
      },
    ],
  });

  const serialized = JSON.parse(JSON.stringify(counters));

  return {
    props: {
      rawCounters: serialized,
    },
  };
};

/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
function Home({ rawCounters }) {
  const [pageUnload, setPageUnload] = useState(false);
  const [counters, setCounters] = useState(rawCounters);
  const [configs, setConfigs] = useState({
    type: "add",
    id: 0,
    name: "",
    value: 0,
    date: new Date(),

    daily: false,
    lastUpdated: new Date(),

    error: false,
    timeout: null,
  });

  const [loading, setLoading] = useState(false);

  setDefaultOptions({ locale: ptBR });

  const resetState = () => {
    setConfigs({
      ...configs,
      type: "add",
      name: "",
      value: 0,
      date: new Date(),
      daily: false,
      lastUpdated: new Date(),
      error: false,
    });

    setLoading(false);
  };

  const changeCounter = async ({ type, counter }) => {
    if (configs.timeout) clearTimeout(configs.timeout);
    const timeToSave = setTimeout(() => {
      console.log("Updating database");

      api
        .put(`/counters/${counter.id}`, {
          ...counter,
          value: type === "add" ? counter.value + 1 : counter.value - 1,
        })
        .then((res) => {
          const newCounters = counters.map((each) =>
            each.id === counter.id
              ? {
                  ...res.data,
                  value: res.data.value,
                }
              : each
          );

          setCounters(newCounters);
        });
    }, 1000);

    setConfigs({
      ...configs,
      timeout: timeToSave,
    });
  };

  const saveItem = () => {
    setLoading(true);

    if (configs.name) {
      if (configs.type === "edit") {
        api
          .put(`/counters/${configs.id}`, {
            id: configs.id,
            name: configs.name,
            value: configs.value,
            date: new Date(configs.date),
            daily: configs.daily,
            lastUpdated: new Date(configs.lastUpdated),
          })
          .then((res) => {
            setCounters(
              counters.map((each) => (each.id === configs.id ? res.data : each))
            );

            setTimeout(() => {
              resetState();

              setLoading(false);
            }, 1000);
          });
      } else {
        api
          .post("/counters", {
            name: configs.name,
            value: configs.value,
            date: new Date(configs.date),
            daily: configs.daily,
            lastUpdated: new Date(configs.lastUpdated),
          })
          .then((res) => {
            setTimeout(() => {
              setCounters([...counters, res.data]);
              resetState();

              setLoading(false);
            }, 1000);
          });
      }
    } else {
      setConfigs({
        ...configs,
        error: true,
      });
    }
  };

  return (
    <Drawer onClose={resetState} className="w-full">
      <Head>
        <title>Cafofo Estelar - Contadores</title>
        <meta name="theme_color" content="#f3e8ff" />
        <meta name="theme-color" content="#f3e8ff" />
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
      <div className="flex flex-col items-center justify-start min-h-screen p-8 pt-16 bg-purple-100 text-black">
        <div className="font-logo text-4xl text-neutral-700 mt-1">
          Contadores
        </div>
        <div className="text-xs text-neutral-500 mt-2 uppercase">
          {"Contadores inúteis para coisas inúteis!"}
        </div>

        <DrawerContent className="bg-white flex flex-col gap-2">
          <DrawerHeader>
            <DrawerTitle>Adicionar contador</DrawerTitle>
          </DrawerHeader>
          <div className="flex md:flex-col flex-col gap-2 p-4 pb-0">
            <div className="w-full">
              <Input
                placeholder="Nome do contador"
                value={configs.name}
                error={configs.error}
                // onKeyDown={(e) => {
                //   if (e.key === "Enter") {
                //     saveItem();
                //   }
                // }}
                onChange={(e) => {
                  setConfigs({
                    ...configs,
                    name: e.target.value,
                  });
                }}
              />
            </div>
            <div className="flex gap-2 items-center justify-start flex-grow w-full">
              <div className="w-full">
                <Input
                  placeholder="Valor inicial"
                  type="number"
                  value={configs.value}
                  // onKeyDown={(e) => {
                  //   if (e.key === "Enter") {
                  //     saveItem();
                  //   }
                  // }}
                  onChange={(e) => {
                    setConfigs({
                      ...configs,
                      value: Number(e.target.value),
                    });
                  }}
                />
              </div>
            </div>
          </div>
          <DrawerFooter>
            {configs.type === "edit" && (
              <DrawerClose asChild>
                <Button
                  onClick={() => {
                    api.delete(`/counters/${configs.id}`).then((res) => {
                      setCounters(
                        counters.filter((each) => each.id !== res.data.id)
                      );
                      resetState();
                    });
                  }}
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 /> Excluir
                </Button>
              </DrawerClose>
            )}
            {loading ? (
              <div className="flex items-center justify-center gap-2 w-full">
                <OrbitProgress size="small" color="#0ea5e9" />
              </div>
            ) : (
              <Button onClick={saveItem} variant="movie" className="w-full">
                Salvar
              </Button>
            )}
          </DrawerFooter>
        </DrawerContent>

        <div className="fixed z-50 bottom-4 right-4">
          <DrawerTrigger asChild>
            <div className="flex -mt-6 flex-col gap-2 rounded-full items-end w-full">
              <div className="rounded-full flex items-center justify-center text-white bg-purple-500 p-4">
                <Plus />
              </div>
            </div>
          </DrawerTrigger>
        </div>

        <Section title="Lista de contadores inúteis">
          <div className="flex flex-col h-full gap-2 items-center justify-center w-full">
            {counters.map((counter, i) => (
              <div
                key={i}
                className="transition w-full relative cursor-pointer flex flex-col md:h-full overflow-hidden items-center pb-4 rounded-md bg-white "
              >
                <DrawerTrigger asChild>
                  <div
                    onClick={() => {
                      setConfigs({
                        ...configs,
                        type: "edit",
                        id: counter.id,
                        name: counter.name,
                        value: counter.value,
                        date: counter.date,
                        daily: counter.daily,
                        lastUpdated: counter.lastUpdated,
                      });
                    }}
                    className="absolute -top-1 -right-1 flex items-center justify-center gap-2 p-4 group cursor-pointer"
                  >
                    <Pencil className="text-neutral-500 scale-[0.7]" />
                  </div>
                </DrawerTrigger>

                <div className="font-bold p-4 text-center text-sm max-w-[300px] truncate">
                  {counter.name}
                </div>
                <div className="font-bold text-4xl">{counter.value}</div>
                <div className="flex items-center justify-center gap-4 w-full px-4 pt-4">
                  <Button
                    onClick={() => {
                      const newCounters = counters.map((each) =>
                        each.id === counter.id
                          ? { ...each, value: each.value - 1 }
                          : each
                      );
                      setCounters(newCounters);
                      changeCounter({ type: "remove", counter: counter });
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    -1
                  </Button>
                  <Button
                    onClick={() => {
                      const newCounters = counters.map((each) =>
                        each.id === counter.id
                          ? { ...each, value: each.value + 1 }
                          : each
                      );
                      setCounters(newCounters);
                      changeCounter({ type: "add", counter: counter });
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    +1
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </Drawer>
  );
}

export default Home;
