import React from "react";

function Section({ children, title }) {
  return (
    <div className="mt-6 grid gap-4 md:flex-row border-t border-black/20 w-full place-items-center pt-4">
      <div className="font-bold uppercase text-lg ">{title}</div>
      {children}
    </div>
  );
}

export default Section;
