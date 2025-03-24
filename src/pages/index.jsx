import React, { useState, useEffect } from "react";

import {
  BookHeart,
  Clapperboard,
  Drama,
  Timer,
  ChartGantt,
  CircleCheckBig,
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
    <Dialog open={open} className="outline-none w-full">
      <DialogContent className="bg-[#f3eae3] sm:max-w-[425px]">
        <DialogTitle>Quem é você?</DialogTitle>
        <div className="flex flex-col-reverse md:flex-row-reverse gap-2 w-full items-center justify-center">
          {configs.users.map((user, i) => (
            <div
              key={i}
              onMouseDown={() => {
                setConfigs((prevConfigs) => ({
                  ...prevConfigs,
                  newUser: false,
                  user: {
                    name: user.name,
                    avatar: user.avatar,
                    id: user.id,
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
        <div className="font-logo relative text-4xl text-neutral-700 mt-1">
          Cafofo Estelar
          {configs.user && (
            <div
              onClick={() => {
                setOpen(true);
                setConfigs({
                  ...configs,
                  user: {
                    name: "",
                    avatar: "",
                    id: "",
                  },
                });
              }}
              className="flex group flex-col items-center cursor-pointer absolute top-0 -right-80 rounded-full"
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
        <div className="text-xs text-neutral-500 mt-2 uppercase">
          {"Bem-vinda ao Cafofo Estelar!"}
        </div>
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
