import database from "infra/database.js";
import fs from "node:fs";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

describe("POST to api/v1/migrations", () => {
  describe("Anonymous user", () => {
    describe("Running pending migrations", () => {
      test("For the first time", async () => {
        const result1 = await fetch("http://localhost:3000/api/v1/migrations", {
          method: "POST",
        });
        expect(result1.status).toBe(201);

        let migrationNumber = 0;
        fs.readdir("./infra/migrations", (err, files) => {
          migrationNumber = files.length;
        });
        const migrationsRowsCount = await database.query(
          "SELECT * FROM pgmigrations;",
        );
        expect(migrationsRowsCount.rows.length).toBe(migrationNumber);
      });
      test("For the second time", async () => {
        const result2 = await fetch("http://localhost:3000/api/v1/migrations", {
          method: "POST",
        });
        expect(result2.status).toBe(200);
      });

      test("With methods other than POST", async () => {
        const deleteMethod = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "DELETE",
          },
        );
        expect(deleteMethod.status).toBe(405);

        const putMethod = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "PUT",
          },
        );
        expect(putMethod.status).toBe(405);
      });
    });
  });
});
