// loading animation
// link journal to db
// sign in with discord (only client side)

import React, { useState, useEffect } from "react";

import { TextEditor, Section } from "@/components";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

import { api } from "@/utils";

import { MoveLeft } from "lucide-react";

function Home() {
  const [configs, setConfigs] = useState({
    loggedIn: false,
    userId: "",
    pickedDate: false,
    date: new Date(),
    users: [],
  });

  useEffect(() => {
    api.get("/users").then((res) => {
      setConfigs({
        ...configs,
        users: res.data,
      });
    });
  }, []);

  useEffect(() => {
    if (configs.loggedIn && configs.pickedDate) {
      window.addEventListener("beforeunload", (e) => {
        e.preventDefault();
      });
    }
  }, [configs.loggedIn, configs.pickedDate]);

  return (
    <div>
      <div
        onClick={() => {
          if (!configs.loggedIn) {
            window.location.href = "/";
          } else if (configs.pickedDate) {
            setConfigs({ ...configs, pickedDate: false, date: new Date() });
          } else if (configs.userId) {
            setConfigs({ ...configs, loggedIn: false, user: "" });
          }
        }}
        className="flex items-center justify-center absolute top-0 gap-2 p-4 group cursor-pointer"
      >
        <MoveLeft className="text-neutral-500 text-2xl" />
        <div className="text-xs mt-0.5 text-neutral-500 uppercase group-hover:underline ">
          voltar
        </div>
      </div>
      <div className="flex flex-col items-center justify-start min-h-screen p-8 pt-16 bg-red-50 text-black">
        <div className="font-logo text-4xl text-neutral-700 mt-1">Diário</div>
        <div className="text-xs text-neutral-500 mt-2 uppercase">
          {"Diário para anotar seus sentimentos!"}
        </div>

        {!configs.loggedIn ? (
          <Section title="Quem é você?">
            <div className="flex flex-col-reverse md:flex-row-reverse gap-2 w-full items-center justify-center">
              {configs.users.map((user, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setConfigs({
                      ...configs,
                      loggedIn: true,
                      user: user.id,
                    });
                  }}
                  className="flex flex-col w-full items-center gap-4 rounded-md bg-red-100 p-4 hover:bg-red-500/5 transition cursor-pointer "
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
          </Section>
        ) : configs.pickedDate ? (
          <Section>
            <div className="max-w-screen w-full">
              <TextEditor
                user={configs.user}
                date={configs.date}
                pickDate={() => {
                  setConfigs({
                    ...configs,
                    pickedDate: false,
                  });
                }}
              />
            </div>
          </Section>
        ) : (
          <Section title="Escolha uma data">
            <div className="max-w-screen w-full">
              <div className="flex flex-col gap-2 items-center justify-center w-full">
                <div className="w-full flex items-center flex-col justify-center gap-4">
                  <Calendar
                    mode="single"
                    onSelect={(e) => {
                      setConfigs({ ...configs, pickedDate: true, date: e });
                    }}
                    initialFocus
                    showOutsideDays={false}
                    className="bg-white rounded-lg shadow-md"
                  />

                  <Button
                    onClick={() => {
                      setConfigs({
                        ...configs,
                        loggedIn: false,
                        user: "",
                        date: new Date(),
                      });
                    }}
                    variant="link"
                  >
                    Voltar
                  </Button>
                </div>
              </div>
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

export default Home;
