'use client';

import { HardDriveDownload, LayoutDashboard, Network, Plug, Server, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { roleSatisfies, UserRole } from '@novanode/shared';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  ownerOnly?: boolean;
  adminOnly?: boolean;
}

const ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/nodes', label: 'Nodes', icon: Server },
  { href: '/allocations', label: 'Allocations', icon: Network },
  { href: '/installer', label: 'Installer', icon: HardDriveDownload, adminOnly: true },
  { href: '/integrations', label: 'Integrations', icon: Plug, adminOnly: true },
  { href: '/users', label: 'Users', icon: Users, ownerOnly: true },
];

export function AppNav({
  role,
  orientation = 'vertical',
}: {
  role: string;
  orientation?: 'vertical' | 'horizontal';
}) {
  const pathname = usePathname();
  const isOwner = role === UserRole.OWNER;
  const isAdmin = roleSatisfies(role as UserRole, UserRole.ADMIN);

  return (
    <nav
      className={cn(
        'gap-1',
        orientation === 'vertical' ? 'flex flex-col' : 'flex overflow-x-auto',
      )}
    >
      {ITEMS.filter(
        (item) => (!item.ownerOnly || isOwner) && (!item.adminOnly || isAdmin),
      ).map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
