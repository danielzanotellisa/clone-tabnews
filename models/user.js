import database from "infra/database.js";
import password from "models/password.js"
import { ValidationError, UserNotFound } from "infra/errors";

async function create(data) {
  await validateUniqueEmail(data.email);
  await validateUniqueUserName(data.username);
  await hashPasswordInObject(data);

  const newUser = await runInsertQuery(data);
  return newUser;

  async function validateUniqueEmail(userEmail) {
    const results = await database.query({
      text: `
        SELECT 
          email
        FROM 
          users
        WHERE 
          LOWER(email) = LOWER($1)
        LIMIT 1
      ;`,
      values: [userEmail],
    });

    if (results.rowCount > 0) {
      throw new ValidationError({
        action: "Utilize um email diferente",
        message: "O email utilizado ja está em uso",
      });
    }
  }

  async function validateUniqueUserName(userName) {
    const results = await database.query({
      text: `
        SELECT 
          username
        FROM 
          users
        WHERE 
          LOWER(username) = LOWER($1)
        LIMIT 1
      ;`,
      values: [userName],
    });

    if (results.rowCount > 0) {
      throw new ValidationError({
        action: "Utilize um nome de usuário diferente",
        message: "O nome de usuário ja está em uso",
      });
    }
  }
  
  async function hashPasswordInObject(data) {
    const hashedPassword = await password.hash(data.password)
    data.password = hashedPassword;
  }

  async function runInsertQuery(data) {
    const userCreated = await database.query({
      text: `
          INSERT INTO users 
            (username, email, password) 
          VALUES 
            ($1, $2, $3)
          RETURNING
            *
          ;`,
      values: [data.username, data.email, data.password],
    });
    return userCreated.rows[0];
  }
}
async function findOneByUsername(username) {
  const userFound = await runSelectQuery(username);

  async function runSelectQuery(username) {
    const user = await database.query({
      text: `
      SELECT
        *
      FROM
        users
      WHERE
        LOWER(username) = LOWER($1)
      LIMIT 
        1
    ;`,
      values: [username],
    });
    if (user.rowCount < 1) {
      throw new UserNotFound({
        action: "Verifique se o nome de usuário está correto",
        message: "Usuário informado não existe",
      });
    }

    return user.rows[0];
  }

  return userFound;
}
const user = {
  create,
  findOneByUsername,
};

export default user;
