import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { UserRole } from '@novanode/shared';
import { updateUser } from '@/app/actions/users';
import { UserForm } from '@/components/users/user-form';
import { ApiError, serverApi } from '@/lib/server-api';
import { getProfile } from '@/lib/session';
import type { UserRow } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const profile = await getProfile();
  if (profile.role !== UserRole.OWNER) redirect('/dashboard');

  let user: UserRow;
  try {
    user = await serverApi<UserRow>(`/users/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const action = updateUser.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/users" className="text-sm text-muted-foreground hover:underline">
          ← Kembali ke Users
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Edit User</h1>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>
      <UserForm action={action} user={user} submitLabel="Simpan Perubahan" />
    </div>
  );
}
