import React, { useState } from "react";

import { api } from "@/utils";
import { prisma } from "@/lib/database";

import { format, setDefaultOptions, addDays } from "date-fns";
import { id, ptBR } from "date-fns/locale";

import { Section, Timeline } from "@/components";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import Head from "next/head";

import { CalendarIcon, MoveLeft, Plus } from "lucide-react";

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

/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
function Home({ rawEvents }) {
  setDefaultOptions({ locale: ptBR });

  const [configs, setConfigs] = useState({
    date: new Date(),
    type: "add",
    title: "",
    text: "",
    id: 0,
    open: false,
  });

  const [items, setItems] = useState(rawEvents);

  const resetState = () => {
    setConfigs({
      date: new Date(),
      title: "",
      text: "",
      id: 0,
      open: false,
    });
  };

  const saveData = async () => {
    if (configs.text && configs.title) {
      const date = new Date(configs.date);
      const adjustedDate = addDays(date, 1);

      if (configs.type == "edit") {
        api
          .put(`/events/${configs.id}`, {
            title: configs.title,
            text: configs.text,
            date: date,
            formattedDate: adjustedDate,
            createdAt: new Date(),
            id: configs.id,
          })
          .then(() => {
            window.location.reload();
          });
      } else {
        api
          .post("/events", {
            title: configs.title,
            text: configs.text,
            date: date,
            formattedDate: adjustedDate,
            createdAt: new Date(),
          })
          .then(() => {
            window.location.reload();
          });
      }
    }
  };

  return (
    <Drawer onClose={resetState} open={configs.open} className="w-full">
      <Head>
        <title>Cafofo Estelar - Timeline</title>
      </Head>
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
      <div className="flex flex-col items-center justify-start min-h-screen p-8 pt-16 bg-green-50 text-black">
        <div className="font-logo text-4xl text-neutral-700 mt-1">Timeline</div>
        <div className="text-xs text-neutral-500 mt-2 uppercase">
          {"Timeline de eventos!"}
        </div>

        <div className="fixed z-50 bottom-4 right-4">
          <DrawerTrigger asChild>
            <div className="flex -mt-6 flex-col gap-2 rounded-full items-end w-full">
              <div
                onClick={() => {
                  setConfigs({
                    ...configs,
                    open: true,
                  });
                }}
                className="rounded-full flex items-center justify-center text-white bg-green-500 p-4"
              >
                <Plus />
              </div>
            </div>
          </DrawerTrigger>
        </div>
        <DrawerContent className="bg-white flex flex-col gap-2">
          <DrawerHeader>
            <DrawerTitle>
              {configs.type === "edit" ? "Editar" : "Adicionar"} evento
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex md:flex-col flex-col gap-2 p-4 pb-0">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"}>
                  <CalendarIcon />
                  {configs.date ? (
                    format(configs.date, "PPP")
                  ) : (
                    <span>Escolha uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={configs.date}
                  onSelect={(e) => {
                    setConfigs({ ...configs, date: e });
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <div className="flex flex-col gap-2 items-center justify-center w-full">
              <div className="w-full">
                <Input
                  placeholder="Título"
                  value={configs.title}
                  onChange={(e) => {
                    setConfigs({ ...configs, title: e.target.value });
                  }}
                />
              </div>
              <Textarea
                placeholder="Descrição do evento"
                value={configs.text}
                onChange={(e) =>
                  setConfigs({ ...configs, text: e.target.value })
                }
                className="w-full h-[150px] resize-none"
              />
            </div>
          </div>
          <DrawerFooter>
            {configs.type === "edit" && (
              <Button
                onClick={() => {
                  api.delete(`/events/${configs.id}`);
                  window.location.reload();
                }}
                variant="destructive"
              >
                Excluir
              </Button>
            )}
            <DrawerClose asChild>
              <Button onClick={saveData} variant="movie">
                SALVAR
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>

        <Section title="Linha do tempo">
          {items.length > 0 ? (
            <div className="w-full">
              <Timeline
                onSelectItem={(e) => {
                  console.log("Editing item");
                  setConfigs({
                    ...configs,
                    type: "edit",
                    date: e.sortDate,
                    formattedDate: e.title,
                    title: e.cardTitle,
                    text: e.cardSubtitle,
                    id: e.id,
                    open: true,
                  });
                }}
                items={items}
              />
            </div>
          ) : (
            <div className="w-full">
              <div className="text-center uppercase text-neutral-500 font-bold text-xs">
                Não há eventos cadastrados!
              </div>
            </div>
          )}
        </Section>
      </div>
    </Drawer>
  );
}

export default Home;
