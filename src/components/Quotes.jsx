import React, { useState, useEffect, use } from "react";

import { api } from "@/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { Trash2 } from "lucide-react";

import { format, set, setDefaultOptions } from "date-fns";
import { ptBR } from "date-fns/locale";

function Quotes({ rawQuotes, user }) {
  const [configs, setConfigs] = useState({
    type: "add",
    id: 0,
    quote: "",
    author: "",
    date: new Date(),
    authorId: user.id,
    error: false,
  });
  const [quotes, setQuotes] = useState(rawQuotes);

  const resetState = () => {
    setConfigs({
      ...configs,
      type: "add",
      id: 0,
      quote: "",
      author: "",
      date: new Date(),
      error: false,
    });
  };

  const saveQuote = () => {
    if (!configs.quote) return setConfigs({ ...configs, error: true });

    if (configs.quote) {
      if (configs.type === "edit") {
        api
          .put(`/quotes/${configs.id}`, {
            id: configs.id,
            quote: configs.quote,
            author: configs.author,
            authorId: configs.authorId,
            date: new Date(),
          })
          .then((res) => {
            setQuotes(
              quotes.map((each) => (each.id === configs.id ? res.data : each))
            );

            resetState();
          });
      } else {
        api
          .post("/quotes", {
            quote: configs.quote,
            author: configs.author,
            authorId: configs.authorId,
            date: new Date(configs.date),
          })
          .then((res) => {
            setQuotes([...quotes, res.data]);

            resetState();
          });
      }
    }
  };

  setDefaultOptions({ locale: ptBR });

  return (
    <Drawer onClose={resetState}>
      <div>
        {quotes.length > 0 ? (
          <div className="flex flex-col w-full gap-2">
            <div className="text-center w-full text-neutral-500">
              {format(quotes[0].date, "PPP")}
            </div>
            {quotes.map((quote, i) => (
              <DrawerTrigger asChild key={i}>
                <div
                  key={i}
                  onClick={() => {
                    setConfigs({
                      ...configs,
                      type:
                        quote.authorId !== configs.authorId ? "look" : "edit",
                      id: quote.id,
                      quote: quote.quote,
                      author: quote.author,
                      date: quote.date,
                    });
                  }}
                  className="flex flex-col cursor-pointer items-center gap-3 p-4 bg-white rounded-md"
                >
                  <div className="text-center  text-lg max-h-[125px] max-w-[300px] pr-4 overflow-y-auto break-words">
                    {quote.quote}
                  </div>
                  <div className="flex gap-2 items-center justify-center w-full">
                    <div className="text-sm max-w-[20ch] w-min font-bold truncate text-neutral-500">
                      {quote.author}
                    </div>
                    -
                    <div className="flex flex-col gap-2 w-min items-start justify-center text-sm text-neutral-400 font-bold">
                      <div>{format(quote.date, "HH:mm")}</div>
                    </div>
                  </div>
                </div>
              </DrawerTrigger>
            ))}
          </div>
        ) : (
          <div className="text-center text-neutral-500">
            Nenhuma frase encontrada
          </div>
        )}
      </div>

      <DrawerTrigger asChild>
        <Button
          onClick={() => {
            const authorQuotes = quotes.filter(
              (each) => each.authorId === configs.authorId
            );

            if (authorQuotes.length > 0) {
              setConfigs({
                ...configs,
                type: "edit",
                id: authorQuotes[0].id,
                quote: authorQuotes[0].quote,
                author: authorQuotes[0].author,
                date: authorQuotes[0].date,
              });
            }
          }}
          variant="movie"
          className="w-full"
        >
          {quotes.filter((each) => each.authorId === configs.authorId).length >
          0
            ? "Editar"
            : "Adicionar"}
        </Button>
      </DrawerTrigger>

      <DrawerContent className="bg-white flex flex-col gap-2">
        <DrawerHeader>
          <DrawerTitle>
            {configs.type === "look" ? (
              <div className="flex items-center gap-1">
                Frase de
                <div className="max-w-[30ch] truncate">{configs.author}</div>
              </div>
            ) : (
              "Adicionar frase"
            )}
          </DrawerTitle>
        </DrawerHeader>
        <div className="flex md:flex-col flex-col gap-2 p-4 pb-0">
          <div>
            <Textarea
              value={configs.quote}
              error={configs.error}
              disabled={configs.type === "look"}
              onChange={(e) => {
                setConfigs({
                  ...configs,
                  quote: e.target.value,
                  error: false,
                });
              }}
              className="resize-none"
              placeholder="Frase"
            />
          </div>
          <div>
            <Input
              value={configs.author}
              disabled={configs.type === "look"}
              onChange={(e) => {
                setConfigs({
                  ...configs,
                  author: e.target.value,
                });
              }}
              placeholder="Nome do autor"
            />
          </div>
        </div>
        <DrawerFooter>
          {configs.type !== "look" && configs.type === "edit" && (
            <DrawerClose asChild>
              <Button
                onClick={() => {
                  api.delete(`/quotes/${configs.id}`).then((res) => {
                    setQuotes(quotes.filter((each) => each.id !== res.data.id));
                  });

                  resetState();
                }}
                variant="destructive"
              >
                <Trash2 />
                <span>Excluir</span>
              </Button>
            </DrawerClose>
          )}
          {configs.quote ? (
            <DrawerClose asChild>
              <Button
                variant="movie"
                onClick={() => {
                  if (configs.type === "look") return;
                  saveQuote();
                }}
                className="w-full"
              >
                {configs.type === "look" ? "Fechar" : "Salvar"}
              </Button>
            </DrawerClose>
          ) : (
            <Button
              variant="movie"
              onClick={() => {
                if (configs.type === "look") return;
                saveQuote();
              }}
              className="w-full"
            >
              {configs.type === "look" ? "Fechar" : "Salvar"}
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default Quotes;
