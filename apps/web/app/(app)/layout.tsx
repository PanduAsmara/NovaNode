import { redirect } from 'next/navigation';
import { APP_NAME } from '@novanode/shared';
import { AppNav } from '@/components/app-nav';
import { Footer } from '@/components/footer';
import { LogoutButton } from '@/components/logout-button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { ApiError } from '@/lib/server-api';
import { getProfile, type Profile } from '@/lib/session';

export const dynamic = 'force-dynamic';

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="bg-gradient-brand grid h-9 w-9 place-items-center rounded-lg text-sm font-bold text-white shadow-md shadow-indigo-500/20">
        N
      </span>
      <div className="leading-tight">
        <p className="text-sm font-semibold tracking-tight">{APP_NAME}</p>
        <p className="text-[11px] text-muted-foreground">Control Center</p>
      </div>
    </div>
  );
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let profile: Profile;
  try {
    profile = await getProfile();
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect('/login');
    throw err;
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-card px-4 py-6 md:flex">
        <div className="px-2 pb-6">
          <Brand />
        </div>
        <AppNav role={profile.role} />
        <div className="mt-auto px-2 pt-6">
          <div className="rounded-lg border bg-background/50 p-3">
            <p className="truncate text-sm font-medium">{profile.name}</p>
            <Badge variant="secondary" className="mt-1">
              {profile.role}
            </Badge>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b bg-background/80 px-4 py-3 backdrop-blur md:px-6">
          <div className="md:hidden">
            <Brand />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="truncate text-sm font-medium">{profile.name}</p>
              <p className="text-xs text-muted-foreground">{profile.role}</p>
            </div>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>

        {/* Mobile nav bar */}
        <div className="border-b px-3 py-2 md:hidden">
          <AppNav role={profile.role} orientation="horizontal" />
        </div>

        <main className="flex-1 p-4 md:p-6">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
