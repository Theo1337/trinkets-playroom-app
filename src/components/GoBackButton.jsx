import Link from "next/link";
import { MoveLeft } from "lucide-react";

const GoBackButton = () => {
  return (
    <Link
      href="/"
      className="flex items-center justify-center absolute top-0 left-0 gap-2 p-4 group cursor-pointer"
    >
      <MoveLeft className="text-neutral-500 text-2xl" />
      <div className="text-xs mt-0.5 text-neutral-500 uppercase group-hover:underline ">
        início
      </div>
    </Link>
  );
};

export default GoBackButton;
