import { NextResponse } from 'next/server';
import { serverApi } from '@/lib/server-api';
import type { InstallationDetail } from '@/lib/types';

/**
 * Authenticated proxy for client-side log polling. The browser cannot read the
 * httpOnly auth cookie, so the live-log viewer polls this route, which forwards
 * the request to the API using the session cookies via {@link serverApi}.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  try {
    const data = await serverApi<InstallationDetail>(`/installer/logs/${id}`);
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengambil log';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
