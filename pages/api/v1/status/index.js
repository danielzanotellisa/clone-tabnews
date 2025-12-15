import database from "/infra/database.js";
import { InternalServerError } from "infra/errors.js";
async function status(request, response) {
  try {
    const updatedAt = new Date().toISOString();
  const maxConnections = await database.query("SHOW max_connections;");
  const postgresVersion = await database.query("SHOW server_version;");

  const databaseName = process.env.POSTGRES_DB;
  const activeConnections = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        db_version: postgresVersion.rows[0].server_version,
        max_connections: parseInt(maxConnections.rows[0].max_connections),
        active_connections: activeConnections.rows[0].count,
      },
    },
  });
  } catch (error) {
    const publicErrorObj = new InternalServerError({
      cause: error
    });
    console.error(publicErrorObj)
    response.status(500).json(publicErrorObj)
  }
}

export default status;
