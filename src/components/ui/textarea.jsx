import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef(
  ({ className, error, homeInput, ...props }, ref) => {
    return (
      <textarea
        aria-checked={error}
        className={cn(
          "aria-checked:border-red-600 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-2 placeholder:text-muted-foreground  focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
          homeInput
            ? "ring-offset-1"
            : "ring-offset-background focus-visible:outline-none"
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
