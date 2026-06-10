/**
 * NovaNode seed script — populates sample nodes, allocations, and users so the
 * dashboard and management pages have data to show.
 *
 * Idempotent: nodes/allocations are only created when no nodes exist yet;
 * sample users are upserted by email so re-running is safe.
 *
 * Run with:  pnpm db:seed
 */
const fs = require('node:fs');
const path = require('node:path');

// @prisma/client does not auto-load .env (only the Prisma CLI does), so load
// DATABASE_URL from packages/database/.env before instantiating the client.
if (!process.env.DATABASE_URL) {
  const envPath = path.resolve(__dirname, '../.env');
  const match = fs.readFileSync(envPath, 'utf8').match(/^DATABASE_URL=(.*)$/m);
  if (match) process.env.DATABASE_URL = match[1].trim();
}

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const SAMPLE_NODES = [
  { name: 'sg-node-1', fqdn: 'sg1.novanode.local', location: 'Singapore', status: 'ONLINE', ports: 8 },
  { name: 'jkt-node-1', fqdn: 'jkt1.novanode.local', location: 'Jakarta', status: 'OFFLINE', ports: 5 },
  { name: 'us-node-1', fqdn: 'us1.novanode.local', location: 'New York', status: 'UNKNOWN', ports: 3 },
];

const SAMPLE_USERS = [
  { name: 'Admin Demo', username: 'admin', email: 'admin@novanode.local', role: 'ADMIN' },
  { name: 'Viewer Demo', username: 'viewer', email: 'viewer@novanode.local', role: 'VIEWER' },
];

const SAMPLE_PASSWORD = 'password123';

async function main() {
  // --- Nodes + allocations (only when the table is empty) ---
  const existingNodes = await prisma.node.count();
  if (existingNodes === 0) {
    let allocationTotal = 0;
    for (const node of SAMPLE_NODES) {
      const created = await prisma.node.create({
        data: { name: node.name, fqdn: node.fqdn, location: node.location, status: node.status },
      });
      const data = [];
      for (let i = 0; i < node.ports; i++) {
        data.push({ nodeId: created.id, ip: '0.0.0.0', port: 25565 + i, alias: `${node.name}-${i + 1}` });
      }
      const res = await prisma.allocation.createMany({ data, skipDuplicates: true });
      allocationTotal += res.count;
    }
    console.log(`Seeded ${SAMPLE_NODES.length} nodes and ${allocationTotal} allocations.`);
  } else {
    console.log(`Skipped node seed (${existingNodes} node(s) already exist).`);
  }

  // --- Sample users (upsert by email; safe to re-run) ---
  const passwordHash = await bcrypt.hash(SAMPLE_PASSWORD, 12);
  for (const user of SAMPLE_USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, username: user.username, role: user.role },
      create: {
        name: user.name,
        username: user.username,
        email: user.email,
        passwordHash,
        role: user.role,
      },
    });
  }
  console.log(`Upserted ${SAMPLE_USERS.length} sample users (password: "${SAMPLE_PASSWORD}").`);

  const [nodes, allocations, users] = await Promise.all([
    prisma.node.count(),
    prisma.allocation.count(),
    prisma.user.count(),
  ]);
  console.log(`Totals → nodes: ${nodes}, allocations: ${allocations}, users: ${users}`);
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
