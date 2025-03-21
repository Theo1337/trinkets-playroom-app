import React from "react";

import { TextEditor, Section } from "@/components";

import { MoveLeft } from "lucide-react";

function Home() {
  return (
    <div>
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
      <div className="flex flex-col items-center justify-start min-h-screen p-8 pt-16 bg-red-50 text-black">
        <div className="font-logo text-4xl text-neutral-700 mt-1">Diário</div>
        <div className="text-xs text-neutral-500 mt-2 uppercase">
          {"Diário para anotar seus sentimentos!"}
        </div>

        <Section>
          <TextEditor />
        </Section>
      </div>
    </div>
  );
}

export default Home;
