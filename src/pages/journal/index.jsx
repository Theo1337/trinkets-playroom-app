// loading animation (wip)
// link journal to db

import React, { useState, useEffect } from "react";

import { TextEditor, Section } from "@/components";

import { Calendar } from "@/components/ui/calendar";

import { prisma } from "@/lib/database";
import { api } from "@/utils";

import { format } from "date-fns";

import { MoveLeft } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const getServerSideProps = async () => {
  const pages = await prisma.journals.findMany({
    orderBy: [
      {
        date: "desc",
      },
    ],
  });

  const serialized = JSON.parse(JSON.stringify(pages));

  return {
    props: {
      rawPages: serialized,
    },
  };
};

/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */

function Home({ rawPages }) {
  const [configs, setConfigs] = useState({
    loggedIn: false,
    user: "",
    pickedDate: false,
    date: new Date(),
    users: [],
    currentPage: 0,
    saved: false,
  });
  const [currentPage, setCurrentPage] = useState({
    id: 0,
    title: "",
    text: JSON.stringify([
      {
        type: "paragraph",
        children: [
          { text: "Digite aqui o que esta sentindo (Tem que apagar isso)" },
        ],
      },
    ]),
    passwordProtected: false,
    password: "",
    userId: "",
    date: configs.date,
  });

  const [passwordDialog, setPasswordDialog] = useState({
    error: false,
    open: false,
    type: "text",
  });
  const [passwordValue, setPasswordValue] = useState(currentPage.password);

  const [pages, setPages] = useState(rawPages);

  useEffect(() => {
    api.get("/users").then((res) => {
      setConfigs({
        ...configs,
        users: res.data,
      });
    });
  }, []);

  useEffect(() => {
    if (configs.loggedIn && configs.pickedDate && !configs.saved) {
      window.addEventListener("beforeunload", (e) => {
        e.preventDefault();
      });
    }
  }, [configs.loggedIn, configs.pickedDate, configs.saved]);

  const saveItem = (e) => {
    if (e.saved) {
      api
        .put(`/journals/${e.id}`, {
          id: e.id,
          title: e.title,
          text: JSON.stringify(e.value),
          passwordProtected: e.passwordProtected,
          password: e.password,
          date: e.date,
          userId: configs.user,
        })
        .then((res) => {
          setPages(
            pages.map((each) => (each.id === res.data.id ? res.data : each))
          );

          setCurrentPage(res.data);
        });
    } else {
      api
        .post(`/journals`, {
          title: e.title,
          text: JSON.stringify(e.value),
          passwordProtected: e.passwordProtected,
          password: e.password,
          userId: configs.user,
          date: e.date,
        })
        .then((res) => {
          setPages([res.data, ...pages]);
          setConfigs({
            ...configs,
            currentPage: res.data.id,
          });
        });
    }
    setConfigs({
      ...configs,
      saved: e.saved,
    });
  };

  const resetState = () => {
    setCurrentPage({
      id: 0,
      title: "",
      text: JSON.stringify([
        {
          type: "paragraph",
          children: [
            { text: "Digite aqui o que esta sentindo (Tem que apagar isso)" },
          ],
        },
      ]),
      passwordProtected: false,
      password: "",
      userId: "",
      date: configs.date,
    });
  };

  return (
    <Dialog open={passwordDialog.open} className="outline-none md:w-full">
      <DialogContent className="border-0 outline-0 bg-white md:w-full md:translate-y-0 w-[375px] rounded-lg -translate-y-40">
        <DialogTitle>Senha</DialogTitle>
        <div className="w-[330px] md:w-full">
          <Input
            value={passwordValue}
            onChange={(e) => {
              setPasswordValue(e.target.value);
              setPasswordDialog({ ...passwordDialog, error: false });
            }}
            type={passwordDialog.type === "password" ? "password" : "text"}
            placeholder="Digite a senha"
            error={passwordDialog.error}
            onKeyDown={(e) => {
              if (!configs.pickedDate && e.key === "Enter") {
                if (passwordValue === currentPage.password) {
                  setPasswordDialog({
                    open: false,
                    type: "text",
                  });

                  setConfigs({
                    ...configs,
                    pickedDate: true,
                  });
                } else {
                  setPasswordDialog({
                    ...passwordDialog,
                    error: true,
                  });
                }
              }
            }}
          />
          <DialogFooter>
            <div className="flex items-center justify-between gap-2 mt-4 w-full">
              {passwordDialog.type === "text" &&
                currentPage.passwordProtected && (
                  <div>
                    <Button
                      onClick={() => {
                        setPasswordDialog({
                          open: false,
                          type: "text",
                        });

                        saveItem({
                          id: currentPage.id,
                          title: currentPage.title,
                          value: currentPage.value,
                          passwordProtected: false,
                          password: "",
                          date: currentPage.date,
                          userId: configs.user,
                          saved: true,
                        });
                      }}
                      variant="link"
                      className="text-red-500"
                    >
                      Remover
                    </Button>
                  </div>
                )}
              <div className="flex items-center justify-end w-full gap-2">
                <Button
                  onClick={() => {
                    setPasswordDialog({
                      open: false,
                      type: "text",
                    });
                  }}
                  variant="link"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    if (passwordDialog.type === "password") {
                      if (passwordValue === currentPage.password) {
                        setPasswordDialog({
                          open: false,
                          type: "text",
                        });

                        setConfigs({
                          ...configs,
                          pickedDate: true,
                        });
                      } else {
                        setPasswordDialog({
                          ...passwordDialog,
                          error: true,
                        });
                      }
                    } else {
                      setPasswordDialog({
                        open: false,
                        type: "text",
                      });

                      saveItem({
                        id: currentPage.id,
                        title: currentPage.title,
                        value: currentPage.value,
                        passwordProtected: true,
                        password: passwordValue,
                        date: currentPage.date,
                        userId: configs.user,
                        saved: true,
                      });
                    }
                  }}
                  variant="save"
                >
                  {passwordDialog.type === "password" ? "Entrar" : "Salvar"}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>

      <div>
        <div
          onClick={() => {
            if (!configs.loggedIn) {
              window.location.href = "/";
            } else if (configs.pickedDate) {
              setConfigs({ ...configs, pickedDate: false, date: new Date() });
              resetState();
            } else if (configs.user) {
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
              <div className="max-w-screen w-full md:scale-75 md:-translate-y-28">
                <TextEditor
                  user={configs.user}
                  date={configs.date}
                  currentPage={configs.currentPage}
                  currentPageValues={currentPage}
                  togglePasswordDialog={() => {
                    setPasswordDialog({
                      open: true,
                      type: "text",
                    });

                    setPasswordValue(currentPage.password);
                  }}
                  pickDate={() => {
                    setConfigs({
                      ...configs,
                      pickedDate: false,
                    });

                    resetState();
                  }}
                  saveData={(e) => {
                    saveItem(e);
                  }}
                  deleteItem={(e) => {
                    api.delete(`/journals/${e.id}`).then((res) => {
                      setConfigs({
                        ...configs,
                        pickedDate: false,
                      });
                      setPages(pages.filter((each) => each.id !== res.data.id));

                      resetState();
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
                      onDayClick={(e) => {
                        const page = pages
                          .filter((each) => each.userId === configs.user)
                          .filter(
                            (each) =>
                              format(each.date, "yyyy-MM-dd") ==
                              format(e, "yyyy-MM-dd")
                          )[0]
                          ? pages.filter(
                              (each) =>
                                format(each.date, "yyyy-MM-dd") ==
                                format(e, "yyyy-MM-dd")
                            )[0]
                          : currentPage;

                        setCurrentPage(page);

                        setConfigs({
                          ...configs,
                          date: e,
                        });

                        if (page.passwordProtected) {
                          setPasswordDialog({
                            open: true,
                            type: "password",
                          });

                          setPasswordValue("");
                        } else {
                          setConfigs({ ...configs, pickedDate: true, date: e });
                        }
                      }}
                      initialFocus
                      showOutsideDays={false}
                      className="bg-white rounded-lg shadow-md"
                      enableDays={pages
                        .filter((each) => each.userId === configs.user)
                        .map((each) => each.date)}
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
    </Dialog>
  );
}

export default Home;
