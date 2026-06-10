import { InstallableService, type SupportedOS } from '@novanode/shared';

/**
 * Real, idempotent provisioning scripts for the supported components.
 *
 * Each script is plain bash, runnable on Ubuntu 22.04 / 24.04 and Debian 12.
 * They all start with `set -e` and a "already installed?" guard so re-running an
 * install (One-Click Repair) is safe. Scripts assume they run as root (or via
 * sudo); the SSH layer wraps them accordingly.
 */

/** True for Ubuntu targets (used to branch on the PHP/apt repo source). */
function isUbuntu(os: SupportedOS): boolean {
  return os.startsWith('Ubuntu');
}

const DOCKER = `set -e
if command -v docker >/dev/null 2>&1; then
  echo "[docker] already installed: $(docker --version)"
  exit 0
fi
echo "[docker] installing via get.docker.com ..."
export DEBIAN_FRONTEND=noninteractive
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker
echo "[docker] done: $(docker --version)"`;

const MARIADB = `set -e
if command -v mariadb >/dev/null 2>&1 || command -v mysql >/dev/null 2>&1; then
  echo "[mariadb] already installed"
  exit 0
fi
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y mariadb-server
systemctl enable --now mariadb
echo "[mariadb] done"`;

const POSTGRESQL = `set -e
if command -v psql >/dev/null 2>&1; then
  echo "[postgresql] already installed"
  exit 0
fi
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y postgresql postgresql-contrib
systemctl enable --now postgresql
echo "[postgresql] done"`;

const REDIS = `set -e
if command -v redis-server >/dev/null 2>&1; then
  echo "[redis] already installed"
  exit 0
fi
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y redis-server
systemctl enable --now redis-server
echo "[redis] done"`;

const NGINX = `set -e
if command -v nginx >/dev/null 2>&1; then
  echo "[nginx] already installed"
  exit 0
fi
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y nginx
systemctl enable --now nginx
echo "[nginx] done"`;

/** PHP 8.3 toolchain + Composer; repo source differs Ubuntu vs Debian. */
function phpStack(os: SupportedOS): string {
  const repo = isUbuntu(os)
    ? `add-apt-repository -y ppa:ondrej/php`
    : `curl -sSL https://packages.sury.org/php/README.txt | bash -x`;
  return `set -e
export DEBIAN_FRONTEND=noninteractive
echo "[php] installing toolchain ..."
apt-get update -y
apt-get install -y software-properties-common curl ca-certificates gnupg2 lsb-release apt-transport-https unzip git
${repo}
apt-get update -y
apt-get install -y php8.3 php8.3-cli php8.3-gd php8.3-mysql php8.3-pdo php8.3-mbstring php8.3-tokenizer php8.3-bcmath php8.3-xml php8.3-fpm php8.3-curl php8.3-zip
if ! command -v composer >/dev/null 2>&1; then
  curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
fi
echo "[php] done: $(php -v | head -1)"`;
}

/** Download + bootstrap the Pterodactyl panel files (idempotent). */
const PANEL_FILES = `set -e
export DEBIAN_FRONTEND=noninteractive
mkdir -p /var/www/pterodactyl
cd /var/www/pterodactyl
if [ -f composer.json ]; then
  echo "[panel] files already present, skipping download"
else
  echo "[panel] downloading latest release ..."
  curl -Lo panel.tar.gz https://github.com/pterodactyl/panel/releases/latest/download/panel.tar.gz
  tar -xzf panel.tar.gz && rm -f panel.tar.gz
  chmod -R 755 storage/* bootstrap/cache/ || true
  cp -n .env.example .env || true
fi
echo "[panel] installing PHP dependencies ..."
composer install --no-dev --optimize-autoloader --no-interaction
if ! grep -q '^APP_KEY=base64' .env 2>/dev/null; then
  php artisan key:generate --force
fi
echo "[panel] base install done. Finish setup: configure .env (DB/Redis/URL), run 'php artisan migrate --seed', and add the nginx server block."`;

const WINGS = `set -e
if [ -x /usr/local/bin/wings ]; then
  echo "[wings] already installed: $(/usr/local/bin/wings version 2>/dev/null || echo present)"
  exit 0
fi
echo "[wings] installing ..."
mkdir -p /etc/pterodactyl
ARCH="$([ "$(uname -m)" = "x86_64" ] && echo amd64 || echo arm64)"
curl -L -o /usr/local/bin/wings "https://github.com/pterodactyl/wings/releases/latest/download/wings_linux_$ARCH"
chmod u+x /usr/local/bin/wings
cat > /etc/systemd/system/wings.service <<'UNIT'
[Unit]
Description=Pterodactyl Wings Daemon
After=docker.service
Requires=docker.service
PartOf=docker.service

[Service]
User=root
WorkingDirectory=/etc/pterodactyl
LimitNOFILE=4096
PIDFile=/var/run/wings/daemon.pid
ExecStart=/usr/local/bin/wings
Restart=on-failure
StartLimitInterval=180
StartLimitBurst=30
RestartSec=5s

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable wings
echo "[wings] installed. Configure /etc/pterodactyl/config.yml (from the panel) then: systemctl start wings"`;

const UPDATE = `set -e
export DEBIAN_FRONTEND=noninteractive
echo "[update] refreshing apt and upgrading packages ..."
apt-get update -y
apt-get upgrade -y
if [ -x /usr/local/bin/wings ]; then
  echo "[update] updating wings binary ..."
  ARCH="$([ "$(uname -m)" = "x86_64" ] && echo amd64 || echo arm64)"
  curl -L -o /usr/local/bin/wings "https://github.com/pterodactyl/wings/releases/latest/download/wings_linux_$ARCH"
  chmod u+x /usr/local/bin/wings
  systemctl restart wings || true
fi
echo "[update] done"`;

const REPAIR = `set -e
echo "[repair] restarting present services ..."
for svc in docker mariadb postgresql redis-server nginx php8.3-fpm wings; do
  if systemctl list-unit-files 2>/dev/null | grep -q "^$svc"; then
    if systemctl restart "$svc" 2>/dev/null; then
      echo "[repair] restarted $svc"
    else
      echo "[repair] could not restart $svc"
    fi
  fi
done
echo "[repair] done"`;

/** A single ordered provisioning step. */
export interface ScriptStep {
  /** The component this step provisions (or SYSTEM for host-wide actions). */
  service: InstallableService | 'SYSTEM';
  description: string;
  /** Idempotent bash to execute over SSH. */
  script: string;
}

/** Per-service install script. OS only matters for the PHP/panel stack (see phpStep). */
export function serviceScript(service: InstallableService, _os: SupportedOS): ScriptStep {
  switch (service) {
    case InstallableService.DOCKER:
      return { service, description: 'Install Docker Engine', script: DOCKER };
    case InstallableService.MARIADB:
      return { service, description: 'Install MariaDB server', script: MARIADB };
    case InstallableService.POSTGRESQL:
      return { service, description: 'Install PostgreSQL server', script: POSTGRESQL };
    case InstallableService.REDIS:
      return { service, description: 'Install Redis server', script: REDIS };
    case InstallableService.NGINX:
      return { service, description: 'Install Nginx', script: NGINX };
    case InstallableService.PANEL:
      return { service, description: 'Download & bootstrap Pterodactyl panel', script: PANEL_FILES };
    case InstallableService.WINGS:
      return { service, description: 'Install Pterodactyl Wings daemon', script: WINGS };
    default:
      throw new Error(`Unknown service: ${service as string}`);
  }
}

export const SYSTEM_UPDATE: ScriptStep = {
  service: 'SYSTEM',
  description: 'Update system packages',
  script: UPDATE,
};

export const SYSTEM_REPAIR: ScriptStep = {
  service: 'SYSTEM',
  description: 'Repair (restart) services',
  script: REPAIR,
};

/** PHP toolchain step, used as a prerequisite for the panel. */
export function phpStep(os: SupportedOS): ScriptStep {
  return { service: InstallableService.PANEL, description: 'Install PHP 8.3 + Composer', script: phpStack(os) };
}
