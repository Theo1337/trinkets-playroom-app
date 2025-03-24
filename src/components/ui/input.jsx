import * as React from "react";

import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

import { CircleAlert } from "lucide-react";

const inputVariants = cva(
  "aria-checked:border-red-600 flex h-10 w-full bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variant: {
        default: "rounded-md border border-input",
        standard: "border-b border-b-input",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Input = React.forwardRef(
  ({ className, type, error, variant, errorMessage, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type={type}
          aria-checked={error}
          autoComplete="off"
          className={cn(inputVariants({ variant, className }))}
          ref={ref}
          {...props}
        />

        {error && errorMessage && (
          <div className="flex items-center justify-center -bottom-6 gap-1 absolute text-red-500">
            <CircleAlert className="h-4 w-4" />

            <div className="text-xs">{errorMessage}</div>
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
