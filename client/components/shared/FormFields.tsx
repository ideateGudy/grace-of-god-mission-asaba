import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn, Path, FieldValues } from "react-hook-form";
import React from "react";
import { fromLagosDateTimeInput, toLagosDateTimeInput } from "@/lib/date";

export function TextField<T extends FieldValues>({
  form, name, label, description, placeholder, type = "text", ...props
}: { form: UseFormReturn<T>, name: Path<T>, label: string, description?: string, placeholder?: string, type?: string } & Omit<React.ComponentProps<"input">, "form" | "name">) {
  return (
    <FormField control={form.control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input type={type} placeholder={placeholder} {...field} {...props} value={field.value ?? ""} />
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    )} />
  );
}

export function TextAreaField<T extends FieldValues>({
  form, name, label, description, placeholder, ...props
}: { form: UseFormReturn<T>, name: Path<T>, label: string, description?: string, placeholder?: string } & Omit<React.ComponentProps<"textarea">, "form" | "name">) {
  return (
    <FormField control={form.control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Textarea placeholder={placeholder} className="min-h-[100px]" {...field} {...props} value={field.value ?? ""} />
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    )} />
  );
}

export function SelectField<T extends FieldValues>({
  form, name, label, description, placeholder, options
}: { form: UseFormReturn<T>, name: Path<T>, label: string, description?: string, placeholder?: string, options: { label: string, value: string }[] }) {
  return (
    <FormField control={form.control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <Select onValueChange={field.onChange} defaultValue={field.value}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {options.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
          </SelectContent>
        </Select>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    )} />
  );
}

export function SwitchField<T extends FieldValues>({
  form, name, label, description
}: { form: UseFormReturn<T>, name: Path<T>, label: string, description?: string }) {
  return (
    <FormField control={form.control} name={name} render={({ field }) => (
      <FormItem className="flex flex-row items-center justify-between rounded-[var(--radius-md)] border p-4">
        <div className="space-y-0.5">
          <FormLabel className="text-base">{label}</FormLabel>
          {description && <FormDescription>{description}</FormDescription>}
        </div>
        <FormControl>
          <Switch checked={field.value} onCheckedChange={field.onChange} />
        </FormControl>
      </FormItem>
    )} />
  );
}

export function DateTimeField<T extends FieldValues>({
  form, name, label, description
}: { form: UseFormReturn<T>, name: Path<T>, label: string, description?: string }) {
  return (
    <FormField control={form.control} name={name} render={({ field }) => {
      const val = toLagosDateTimeInput(field.value as string | Date | null | undefined);
      return (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input type="datetime-local" value={val} onChange={(e) => field.onChange(fromLagosDateTimeInput(e.target.value))} onBlur={field.onBlur} ref={field.ref} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      );
    }} />
  );
}

export const UrlField = TextField;
export const ImageUrlField = TextField;
export const SlugField = TextField;
