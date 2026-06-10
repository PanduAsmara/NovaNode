import { Injectable, Logger } from '@nestjs/common';
import { NodeSSH } from 'node-ssh';

/** Resolved SSH target (secret already decrypted). */
export interface SshConnection {
  host: string;
  port: number;
  username: string;
  authType: 'PASSWORD' | 'KEY';
  /** Plaintext password or private key, depending on authType. */
  secret: string;
}

export interface SshRunResult {
  code: number;
}

/**
 * Thin wrapper around `node-ssh` for the installer / wings / monitoring modules.
 *
 * Scripts are base64-encoded and piped into bash on the remote host so that
 * arbitrary content (heredocs, quotes, newlines) survives transport intact.
 * Non-root users are run through `sudo -n` (passwordless sudo required).
 */
@Injectable()
export class SshService {
  private readonly logger = new Logger(SshService.name);

  /** Wrap a bash script so it runs intact (and as root) on the target. */
  private wrap(script: string, username: string): string {
    const b64 = Buffer.from(script, 'utf8').toString('base64');
    const runner = username === 'root' ? 'bash' : 'sudo -n bash';
    return `printf '%s' '${b64}' | base64 -d | ${runner}`;
  }

  private async connect(conn: SshConnection): Promise<NodeSSH> {
    const ssh = new NodeSSH();
    await ssh.connect({
      host: conn.host,
      port: conn.port,
      username: conn.username,
      readyTimeout: 20_000,
      ...(conn.authType === 'KEY' ? { privateKey: conn.secret } : { password: conn.secret }),
    });
    return ssh;
  }

  /**
   * Run a bash script on the target, streaming stdout+stderr to `onData`.
   * Resolves with the remote exit code (throws only on connection failure).
   */
  async runScript(
    conn: SshConnection,
    script: string,
    onData: (chunk: string) => void,
  ): Promise<SshRunResult> {
    const ssh = await this.connect(conn);
    try {
      const result = await ssh.execCommand(this.wrap(script, conn.username), {
        onStdout: (chunk) => onData(chunk.toString('utf8')),
        onStderr: (chunk) => onData(chunk.toString('utf8')),
      });
      return { code: result.code ?? 0 };
    } finally {
      ssh.dispose();
    }
  }

  /**
   * Run a single command and return its trimmed stdout (no streaming).
   * Used for quick probes (health checks, metrics). Throws on connection error.
   */
  async exec(conn: SshConnection, command: string): Promise<{ code: number; stdout: string; stderr: string }> {
    const ssh = await this.connect(conn);
    try {
      const result = await ssh.execCommand(command);
      return { code: result.code ?? 0, stdout: result.stdout, stderr: result.stderr };
    } finally {
      ssh.dispose();
    }
  }

  /** Verify TCP+auth connectivity without running anything meaningful. */
  async testConnection(conn: SshConnection): Promise<boolean> {
    try {
      const res = await this.exec(conn, 'echo novanode-ok');
      return res.stdout.includes('novanode-ok');
    } catch (err) {
      this.logger.warn(`SSH test to ${conn.host}:${conn.port} failed: ${(err as Error).message}`);
      return false;
    }
  }
}
