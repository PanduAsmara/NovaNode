'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { UserRole } from '@novanode/shared';
import type { FormState } from '@/app/actions/nodes';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import type { UserRow } from '@/lib/types';

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Menyimpan…' : label}
    </Button>
  );
}

interface UserFormProps {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  user?: UserRow;
  submitLabel: string;
}

export function UserForm({ action, user, submitLabel }: UserFormProps) {
  const [state, formAction] = useActionState(action, { error: null });
  const isEdit = Boolean(user);

  return (
    <form action={formAction} className="grid max-w-xl gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="name">Nama</Label>
        <Input id="name" name="name" defaultValue={user?.name} required minLength={2} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="username">Username</Label>
        <Input id="username" name="username" defaultValue={user?.username} required minLength={3} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" name="email" defaultValue={user?.email} required />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="password">
          {isEdit ? 'Password baru (kosongkan jika tidak diubah)' : 'Password'}
        </Label>
        <Input
          id="password"
          type="password"
          name="password"
          placeholder="Minimal 8 karakter"
          required={!isEdit}
          minLength={8}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="role">Role</Label>
        <Select id="role" name="role" defaultValue={user?.role ?? UserRole.VIEWER}>
          {Object.values(UserRole).map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={user ? user.isActive : true}
          className="h-4 w-4 rounded border-input"
        />
        Aktif
      </label>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="flex items-center gap-3">
        <SubmitButton label={submitLabel} />
        <Link href="/users" className={buttonVariants({ variant: 'outline' })}>
          Batal
        </Link>
      </div>
    </form>
  );
}
