import React from "react";

function Section({ children, title }) {
  return (
    <div
      className={`${
        title && "mt-6 pt-4"
      } md:max-w-4xl grid gap-4 md:flex-row border-t border-black/20 w-full place-items-center `}
    >
      <div className="font-bold uppercase text-lg ">{title}</div>
      {children}
    </div>
  );
}

export default Section;
