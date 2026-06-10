'use client';

import { Trash2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" size="sm" disabled={pending} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
      <Trash2 className="h-4 w-4" />
      {pending ? '…' : label}
    </Button>
  );
}

interface DeleteButtonProps {
  /** Server action that reads `id` from the submitted FormData. */
  action: (formData: FormData) => Promise<void>;
  id: string;
  label?: string;
  confirmMessage?: string;
}

export function DeleteButton({ action, id, label = 'Delete', confirmMessage }: DeleteButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage ?? 'Yakin ingin menghapus item ini?')) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <SubmitButton label={label} />
    </form>
  );
}
