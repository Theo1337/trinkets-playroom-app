import React from "react";
import { OrbitProgress } from "react-loading-indicators";
import { Dialog, DialogTitle, DialogContent } from "@/components/ui/dialog";

function LoadingScreen({ open }) {
  return (
    <Dialog open={open}>
      <DialogContent className="border-0 outline-0">
        <div className="flex flex-col gap-4 items-center justify-center outline-none">
          <DialogTitle className="font-bold text-xl text-white text-center">
            Carregando ...
          </DialogTitle>
          <div className="flex items-center justify-center gap-2 w-full">
            <OrbitProgress color="white" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default LoadingScreen;
