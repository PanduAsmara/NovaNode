import { Activity, GitBranch, Network, Server, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';
import { APP_NAME } from '@novanode/shared';
import { Footer } from '@/components/footer';
import { ThemeToggle } from '@/components/theme-toggle';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const FEATURES = [
  { icon: Server, title: 'Simple', desc: 'Kelola seluruh node Pterodactyl dari satu control center.' },
  { icon: Zap, title: 'Fast', desc: 'Operasi cepat dengan arsitektur API-first dan antrian terdistribusi.' },
  { icon: ShieldCheck, title: 'Secure', desc: 'JWT, refresh token, RBAC, rate limiting, dan audit logging.' },
  { icon: Activity, title: 'Automated', desc: 'Deployment, monitoring, dan maintenance yang terotomatisasi.' },
  { icon: Network, title: 'Scalable', desc: 'Multi-node & multi-location untuk pertumbuhan tanpa batas.' },
  { icon: GitBranch, title: 'Open Source', desc: 'Transparan, dapat di-audit, dan bebas dikembangkan.' },
];

export default function HomePage() {
  return (
    <div className="bg-aurora flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="bg-gradient-brand grid h-9 w-9 place-items-center rounded-lg text-sm font-bold text-white shadow-md shadow-indigo-500/20">
            N
          </span>
          <span className="text-lg font-semibold tracking-tight">{APP_NAME}</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-12 px-4 py-12 text-center">
        <div className="flex max-w-2xl flex-col items-center gap-6">
          <span className="rounded-full border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            Infrastructure Management · Pterodactyl Ecosystem
          </span>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            <span className="text-gradient-brand">NovaNode</span> Control Center
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Platform manajemen infrastruktur profesional untuk mengotomatisasi deployment,
            monitoring, dan operasional ekosistem Pterodactyl — terpusat, aman, dan scalable.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/login" className={cn(buttonVariants({ variant: 'gradient', size: 'lg' }))}>
              Masuk ke Dashboard
            </Link>
            <Link href="/setup" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}>
              Setup Wizard
            </Link>
          </div>
        </div>

        <div className="grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="text-left hover:shadow-md">
                <CardContent className="flex flex-col gap-3 p-6">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
