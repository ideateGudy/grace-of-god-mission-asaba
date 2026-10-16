import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import React, { useId } from "react";

export function OptionCardGroup({
  value,
  onValueChange,
  options,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  name,
  idPrefix,
}: {
  value: string;
  onValueChange: (val: string) => void;
  options: { value: string; label: string; description?: string; icon?: React.ReactNode }[];
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  name?: string;
  idPrefix?: string;
}) {
  const generatedId = useId().replace(/:/g, "");
  const groupName = name ?? `opt-group-${generatedId}`;
  const prefix = idPrefix ?? `opt-${generatedId}`;

  return (
    <RadioGroup
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      value={value}
      onValueChange={onValueChange}
      className={cn("grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4", className)}
      name={groupName}
    >
      {options.map((opt) => {
        const itemId = `${prefix}-${opt.value.toLowerCase()}`;
        return (
          <Label
            key={opt.value}
            htmlFor={itemId}
            className={cn(
              "relative flex flex-col items-start gap-2 rounded-[var(--radius-lg)] border p-4 cursor-pointer hover:bg-muted/50 transition-colors select-none",
              value === opt.value ? "border-primary ring-1 ring-primary bg-muted/20" : "border-border"
            )}
          >
            <RadioGroupItem id={itemId} value={opt.value} className="sr-only" />
            <div className="flex items-center gap-2">
              {opt.icon && <div className="text-muted-foreground">{opt.icon}</div>}
              <span className="font-medium">{opt.label}</span>
            </div>
            {opt.description && <span className="text-sm text-muted-foreground font-normal">{opt.description}</span>}
          </Label>
        );
      })}
    </RadioGroup>
  );
}
