import {
  Cpu,
  HardDrive,
  type LucideIcon,
  MemoryStick,
  Network,
  Server,
  Boxes,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { redirect } from 'next/navigation';
import type { DashboardStats } from '@novanode/shared';
import { Card, CardContent } from '@/components/ui/card';
import { ApiError, serverApi } from '@/lib/server-api';

export const dynamic = 'force-dynamic';

function pct(value: number): string {
  return `${value.toFixed(0)}%`;
}

interface StatCard {
  label: string;
  value: string;
  icon: LucideIcon;
  accent: string;
}

export default async function DashboardPage() {
  let stats: DashboardStats;
  try {
    stats = await serverApi<DashboardStats>('/dashboard/stats');
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect('/login');
    throw err;
  }

  const cards: StatCard[] = [
    { label: 'Total Nodes', value: String(stats.totalNodes), icon: Server, accent: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    { label: 'Total Servers', value: String(stats.totalServers), icon: Boxes, accent: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
    { label: 'Total Allocations', value: String(stats.totalAllocations), icon: Network, accent: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
    { label: 'Online Nodes', value: String(stats.onlineNodes), icon: Wifi, accent: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    { label: 'Offline Nodes', value: String(stats.offlineNodes), icon: WifiOff, accent: 'bg-red-500/10 text-red-600 dark:text-red-400' },
    { label: 'CPU Usage', value: pct(stats.cpuUsage), icon: Cpu, accent: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    { label: 'RAM Usage', value: pct(stats.ramUsage), icon: MemoryStick, accent: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' },
    { label: 'Disk Usage', value: pct(stats.diskUsage), icon: HardDrive, accent: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Ringkasan infrastruktur NovaNode.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label} className="hover:shadow-md">
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">{c.label}</p>
                  <p className="mt-1 text-3xl font-bold tracking-tight">{c.value}</p>
                </div>
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${c.accent}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
