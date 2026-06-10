import { Pencil, Plus } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { UserRole } from '@novanode/shared';
import { deleteUser } from '@/app/actions/users';
import { DeleteButton } from '@/components/delete-button';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { serverApi } from '@/lib/server-api';
import { getProfile } from '@/lib/session';
import type { UserRow } from '@/lib/types';

export const dynamic = 'force-dynamic';

function roleVariant(role: UserRole): 'default' | 'secondary' | 'muted' {
  if (role === UserRole.OWNER) return 'default';
  if (role === UserRole.ADMIN) return 'secondary';
  return 'muted';
}

export default async function UsersPage() {
  const profile = await getProfile();
  // The /users API is OWNER-only; keep non-owners out of the UI entirely.
  if (profile.role !== UserRole.OWNER) redirect('/dashboard');

  const users = await serverApi<UserRow[]>('/users');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-sm text-muted-foreground">Kelola anggota tim & hak akses.</p>
        </div>
        <Link href="/users/new" className={buttonVariants({ variant: 'gradient' })}>
          <Plus className="h-4 w-4" />
          Tambah User
        </Link>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isSelf = user.email === profile.email;
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.username}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={roleVariant(user.role)}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'success' : 'destructive'}>
                      {user.isActive ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/users/${user.id}`}
                        className={buttonVariants({ variant: 'outline', size: 'sm' })}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Link>
                      {!isSelf && (
                        <DeleteButton
                          action={deleteUser}
                          id={user.id}
                          confirmMessage={`Hapus user "${user.name}"?`}
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
