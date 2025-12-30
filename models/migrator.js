import { resolve } from "node:path";
import migrationRunner from "node-pg-migrate";
import database from "infra/database";

async function handleMigration(options) {
  return await migrationRunner({
    dir: resolve(process.cwd(), "infra", "migrations"),
    direction: "up",
    dbClient: options?.dbClient,
    dryRun: options?.dryRun,
    migrationsTable: "pgmigrations",
    log: () => {},
  });
}

async function listPendingMigrations() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const pendingMigrations = await handleMigration({
      dryRun: true,
      dbClient: dbClient,
    });
    return pendingMigrations;
  } finally {
    await dbClient?.end();
  }
}

async function runPendingMigrations() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const migratedMigrations = await handleMigration({
      dryRun: false,
      dbClient: dbClient,
    });
    return migratedMigrations;
  } finally {
    await dbClient?.end();
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
