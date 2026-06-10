import Link from 'next/link';
import { redirect } from 'next/navigation';
import { UserRole } from '@novanode/shared';
import { createUser } from '@/app/actions/users';
import { UserForm } from '@/components/users/user-form';
import { getProfile } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function NewUserPage() {
  const profile = await getProfile();
  if (profile.role !== UserRole.OWNER) redirect('/dashboard');

  return (
    <div className="space-y-6">
      <div>
        <Link href="/users" className="text-sm text-muted-foreground hover:underline">
          ← Kembali ke Users
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Tambah User</h1>
      </div>
      <UserForm action={createUser} submitLabel="Buat User" />
    </div>
  );
}
