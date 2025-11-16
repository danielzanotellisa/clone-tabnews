test("GET request should return 200 from api/v1/status", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  expect(response.status).toBe(200);

  const responseBody = await response.json();

  expect(responseBody.updated_at).toBeDefined();

  const parsedData = new Date(responseBody.updated_at).toISOString();
  expect(responseBody.updated_at).toEqual(parsedData);

  expect(responseBody.dependencies.database.max_connections).toEqual(100);
  expect(responseBody.dependencies.database.db_version).toBe("16.0");

  expect(responseBody.dependencies.database.active_connections).toBeDefined();
  expect(responseBody.dependencies.database.active_connections).toEqual(1);
});
