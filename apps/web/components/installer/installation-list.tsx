'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { InstallationStatus } from '@novanode/shared';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { InstallationDetail, InstallationRow } from '@/lib/types';

function statusVariant(status: InstallationStatus): 'success' | 'destructive' | 'muted' | 'default' {
  if (status === InstallationStatus.SUCCESS) return 'success';
  if (status === InstallationStatus.FAILED) return 'destructive';
  if (status === InstallationStatus.RUNNING) return 'default';
  return 'muted';
}

const isActive = (s: InstallationStatus): boolean =>
  s === InstallationStatus.PENDING || s === InstallationStatus.RUNNING;

/** Format an ISO timestamp deterministically (avoids SSR/client locale drift). */
const fmt = (iso: string): string => iso.replace('T', ' ').slice(0, 19);

/** Polls the log proxy until the job reaches a terminal state. */
function LogViewer({ id, initialStatus }: { id: string; initialStatus: InstallationStatus }) {
  const [log, setLog] = useState('');
  const [status, setStatus] = useState<InstallationStatus>(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/installer/${id}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as InstallationDetail;
      setLog(data.log ?? '');
      setStatus(data.status);
      setError(null);
      return data.status;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengambil log');
      return undefined;
    }
  }, [id]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;
    const tick = async () => {
      const s = await poll();
      if (cancelled) return;
      if (s === undefined || isActive(s)) {
        timer = setTimeout(tick, 2000);
      }
    };
    void tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [poll]);

  useEffect(() => {
    if (preRef.current) preRef.current.scrollTop = preRef.current.scrollHeight;
  }, [log]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant={statusVariant(status)}>{status}</Badge>
        {isActive(status) && <span className="text-xs text-muted-foreground">memuat… (auto-refresh 2s)</span>}
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
      <pre
        ref={preRef}
        className="max-h-80 overflow-auto rounded-md bg-zinc-950 p-3 text-xs leading-relaxed text-zinc-100"
      >
        {log || 'Menunggu output…'}
      </pre>
    </div>
  );
}

export function InstallationList({ installations }: { installations: InstallationRow[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (installations.length === 0) {
    return (
      <div className="rounded-lg border py-10 text-center text-sm text-muted-foreground">
        Belum ada job installer.
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <TableHead>Target</TableHead>
            <TableHead>Aksi</TableHead>
            <TableHead>OS</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Dibuat</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {installations.map((it) => {
            const open = openId === it.id;
            return (
              <Fragment key={it.id}>
                <TableRow
                  className="cursor-pointer"
                  onClick={() => setOpenId(open ? null : it.id)}
                >
                  <TableCell>
                    {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </TableCell>
                  <TableCell className="font-medium">{it.targetIp}</TableCell>
                  <TableCell>{it.kind}</TableCell>
                  <TableCell className="text-muted-foreground">{it.os ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(it.status)}>{it.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{fmt(it.createdAt)}</TableCell>
                </TableRow>
                {open && (
                  <TableRow>
                    <TableCell colSpan={6} className="bg-muted/30">
                      <LogViewer id={it.id} initialStatus={it.status} />
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
