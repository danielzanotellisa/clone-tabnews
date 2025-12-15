import migrationRunner from "node-pg-migrate";
import database from "infra/database";
import { createRouter } from "next-connect";
import { resolve } from "node:path";
import controller from "infra/controller.js";

const dbClient = await database.getNewClient();
const defaultMigrationOptions = {
  dbClient: dbClient,
  dir: resolve(process.cwd(), "infra", "migrations"),
  dryRun: true,
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
};

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const pendingMigrations = await migrationRunner(defaultMigrationOptions);
  response.status(200).json(pendingMigrations);
}

async function postHandler(request, response) {
  const migratedMigrations = await migrationRunner({
    ...defaultMigrationOptions,
    dryRun: false,
  });

  if (migratedMigrations.length > 0) {
    response.status(201).json(migratedMigrations);
    return;
  }

  response.status(200).json(migratedMigrations);
  dbClient.end();
}
