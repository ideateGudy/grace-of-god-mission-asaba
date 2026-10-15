"use client";

import { ReactNode } from "react";
import { UseFormReturn, FieldValues } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Save, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface ResourceFormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: (data: T) => Promise<void>;
  title: string;
  loading?: boolean;
  backHref?: string;
  children: ReactNode;
}

export function ResourceForm<T extends FieldValues>({
  form, onSubmit, title, loading, backHref, children
}: ResourceFormProps<T>) {
  const router = useRouter();
  const { isDirty } = form.formState;

  const handleBack = () => {
    if (isDirty && !window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
      return;
    }
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-24">
        <div className="flex items-center gap-4 mb-6">
          <Button type="button" variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-2xl font-display font-semibold">{title}</h2>
        </div>

        <div className="max-w-3xl space-y-8">
          {children}
        </div>

        {/* Sticky Save Bar */}
        <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 border-t border-border glass-strong z-40 flex justify-end gap-4 shadow-lg animate-in slide-in-from-bottom">
          <Button type="button" variant="outline" onClick={handleBack} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={!isDirty || loading}>
            {loading ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
          </Button>
        </div>
      </form>
    </Form>
  );
}
