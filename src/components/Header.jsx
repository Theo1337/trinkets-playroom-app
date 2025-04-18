import { cn } from "@/lib/utils";
import React from "react";

function Header({ title, description, className }) {
  return (
    <div className={cn("text-center", className)}>
      <h1 className="text-5xl md:text-7xl font-logo text-center text-stone-800 mb-2 drop-shadow-sm">
        {title}
      </h1>
      <div className="text-sm text-neutral-500 mt-4  uppercase">
        {description}
      </div>
    </div>
  );
}

export default Header;
