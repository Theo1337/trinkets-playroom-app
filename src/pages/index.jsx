import React from "react";

import {
  BookHeart,
  Clapperboard,
  Drama,
  Timer,
  ChartGantt,
} from "lucide-react";

import { Section, Quotes } from "@/components";

import { prisma } from "@/lib/database";
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
      name: "Diário",
      icon: <BookHeart className="group-hover:text-red-500 transition" />,
      maintence: true,
    },
    {
      name: "Sonhos",
      icon: <Drama className="group-hover:text-sky-500 transition" />,
      maintence: true,
    },
  ];

  return (
    <div className="flex flex-col items-center md:h-screen p-8 bg-[#f3eae3] min-h-screen text-black ">
      <Head>
        <title>Cafofo Estelar</title>
        <meta name="description" content="Bem-vindo ao Cafofo Estelar!" />
        <link rel="icon" href="favicon.ico" type="image/ico" />
      </Head>
      <div className="font-logo text-4xl text-neutral-700 mt-1">
        Cafofo Estelar
      </div>
      <div className="text-xs text-neutral-500 mt-2 uppercase">
        {"Bem-vinda ao Cafofo Estelar!"}
      </div>
      <Section title="Frase do dia">
        <Quotes rawQuotes={rawQuotes} />
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
  );
}

export default Home;
