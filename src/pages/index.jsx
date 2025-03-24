import React, { useState, useEffect } from "react";

import {
  BookHeart,
  Clapperboard,
  Drama,
  Timer,
  ChartGantt,
  CircleCheckBig,
  LogOut,
} from "lucide-react";

import { Dialog, DialogTitle, DialogContent } from "@/components/ui/dialog";

import { Section, Quotes } from "@/components";

import { prisma } from "@/lib/database";
import { api } from "@/utils";

import Head from "next/head";

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

/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
function Home({ rawQuotes }) {
  const items = [
    {
      name: "Contador de coisas",
      icon: <Timer className="group-hover:text-emerald-500 transition" />,
      maintence: false,
      url: "/counter",
    },
    {
      name: "Lista de filmes",
      icon: <Clapperboard className="group-hover:text-gray-500 transition" />,
      maintence: false,
      url: "/movies",
    },
    {
      name: "Timeline",
      icon: <ChartGantt className="group-hover:text-emerald-500 transition" />,
      maintence: false,
      url: "/timeline",
    },
    {
      name: "Checklist",
      icon: (
        <CircleCheckBig className="group-hover:text-purple-500 transition" />
      ),
      maintence: true,
      url: "/timeline",
    },
    {
      name: "Diário",
      icon: <BookHeart className="group-hover:text-red-500 transition" />,
      maintence: true,
      url: "/journal",
    },
    {
      name: "Sonhos",
      icon: <Drama className="group-hover:text-sky-500 transition" />,
      maintence: true,
    },
  ];

  const [open, setOpen] = useState(false);

  const [configs, setConfigs] = useState({
    user: {
      name: "",
      avatar: "",
      id: "",
      pronoum: "o",
    },
    users: [],
  });

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setConfigs((prevConfigs) => ({
        ...prevConfigs,
        user: JSON.parse(user),
      }));
    }

    api.get("/users").then((res) => {
      setConfigs((prevConfigs) => ({
        ...prevConfigs,
        users: res.data,
      }));
    });
  }, []);

  useEffect(() => {
    if (!configs.user.id) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [configs.user]);

  return (
    <Dialog open={open} className="outline-none md:w-full">
      <DialogContent className="bg-[#f3eae3] max-w-[375px] md:max-w-screen-md outline-none rounded-lg">
        <DialogTitle>Quem é você?</DialogTitle>
        <div className="flex flex-col-reverse md:flex-row-reverse gap-2 w-full items-center justify-center">
          {configs.users.map((user, i) => (
            <div
              key={i}
              onMouseDown={() => {
                setConfigs((prevConfigs) => ({
                  ...prevConfigs,
                  user: {
                    name: user.name,
                    avatar: user.avatar,
                    id: user.id,
                    pronoum: user.pronoum,
                  },
                }));
              }}
              onClick={() => {
                localStorage.setItem("user", JSON.stringify(user));
              }}
              className="flex flex-col w-full items-center gap-4 rounded-md bg-white p-4 hover:bg-red-500/15 transition cursor-pointer "
            >
              <div>
                <img
                  width={512}
                  height={512}
                  src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`}
                  className="w-24 aspect-square rounded-full"
                />
              </div>
              <div className="flex gap-2 items-center justify-center w-full">
                <div className="text-lg max-w-[20ch] w-min font-bold truncate text-neutral-600">
                  {user.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>

      <div className="flex flex-col items-center md:min-h-screen p-8 bg-[#f3eae3] min-h-screen text-black ">
        <Head>
          <title>Cafofo Estelar</title>
          <meta name="description" content="Bem-vindo ao Cafofo Estelar!" />
        </Head>
        <div className="font-logo md:block flex items-center justify-center relative text-4xl text-neutral-700 mt-1">
          Cafofo Estelar
          {configs.user.avatar && (
            <div
              onClick={() => {
                setOpen(true);
                setConfigs({
                  ...configs,
                  user: {
                    name: "",
                    avatar: "",
                    id: "",
                    pronoum: "o",
                  },
                });
              }}
              className="md:flex hidden group flex-col items-center cursor-pointer absolute -right-20 md:top-0 md:-right-80 rounded-full"
            >
              <img
                width={512}
                height={512}
                src={`https://cdn.discordapp.com/avatars/${configs.user?.id}/${configs.user?.avatar}`}
                className="w-12 aspect-square rounded-full"
              />
              <div className="font-body text-xs font-bold group-hover:underline">
                {configs.user?.name}
              </div>
            </div>
          )}
        </div>
        <div className="text-xs text-neutral-500 mt-2 -mb-2 uppercase">
          {`Bem-vind${configs.user.pronoum} ao Cafofo Estelar!`}
        </div>
        {configs.user.id && (
          <Section title="Usuário">
            <div className="flex items-center w-full justify-between">
              <div className="flex gap-4 items-center justify-center w-max">
                <img
                  width={512}
                  height={512}
                  src={`https://cdn.discordapp.com/avatars/${configs.user.id}/${configs.user.avatar}`}
                  className="w-14 aspect-square rounded-full"
                />
                <div>
                  <div className="font-bold  underline">
                    {configs.user.name}
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    {configs.user.id}
                  </div>
                </div>
              </div>
              <div
                onClick={() => {
                  setOpen(true);
                  setConfigs({
                    ...configs,
                    user: {
                      name: "",
                      avatar: "",
                      id: "",
                      pronoum: "o",
                    },
                  });
                }}
                className="rounded-full p-2 w-max"
              >
                <div className="flex items-center bg-black/5 p-2 rounded-full justify-center gap-2">
                  <LogOut className="text-red-500 text-2xl" />
                </div>
              </div>
            </div>
          </Section>
        )}
        <Section title="Frase do dia">
          <Quotes user={configs.user} rawQuotes={rawQuotes} />
        </Section>
        <Section title="Apps">
          <div className="grid items-center grid-cols-2 gap-4 w-full">
            {items.map((item, i) => (
              <div
                key={i}
                aria-disabled={item.maintence}
                aria-checked={!item.maintence}
                onClick={() => {
                  if (item.maintence) return;
                  window.location.href = item.url;
                }}
                className="aria-disabled:bg-gray-300 relative overflow-hidden flex w-full h-full text-center justify-center aria-checked:cursor-pointer aria-checked:group flex-col items-center gap-2 rounded-md bg-neutral-100 p-4 hover:bg-neutral-200 "
              >
                {item.maintence && (
                  <div className="w-3 rotate-45 absolute h-[150%] bg-red-500 "></div>
                )}
                {item.maintence && (
                  <div className="w-3 -rotate-45 absolute h-[150%] bg-red-500 "></div>
                )}
                {item.icon}
                <div className="font-bold">{item.name}</div>
                {item.maintence && (
                  <div className="z-50 text-xs text-black rounded-lg p-1 md:px-4 uppercase bg-white">
                    {"Em breve"}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      </div>
    </Dialog>
  );
}

export default Home;
