import database from "infra/database.js";
import password from "models/password.js";
import { ValidationError, UserNotFound } from "infra/errors";

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
  const hashedPassword = await password.hash(data.password);
  return hashedPassword;
}

async function create(data) {
  await validateUniqueUserName(data.username);
  await validateUniqueEmail(data.email);
  data.password = await hashPasswordInObject(data);

  const newUser = await runInsertQuery(data);
  return newUser;

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
async function update(username, data) {
  const currentUser = await findOneByUsername(username);
  if (
    "username" in data &&
    username.toLowerCase() !== data.username.toLowerCase()
  ) {
    await validateUniqueUserName(data.username);
  }
  if ("email" in data) {
    await validateUniqueEmail(data.email);
  }

  if ("password" in data) {
    data.password = await hashPasswordInObject(data);
  }

  const userWithUpdatedValues = { ...currentUser, ...data };

  const updatedUser = await runUpdateQuery(userWithUpdatedValues);

  async function runUpdateQuery(userWithNewValues) {
    const results = await database.query({
      text: ` 
        UPDATE
          users
        SET
          username = $2,
          email = $3,
          password = $4,
          updated_at = timezone('utc', now())
        WHERE 
          id = $1
        RETURNING 
          *
        
      `,
      values: [
        userWithNewValues.id,
        userWithNewValues.username,
        userWithNewValues.email,
        userWithNewValues.password,
      ],
    });

    return results.rows[0];
  }

  return updatedUser;
}

const user = {
  create,
  findOneByUsername,
  update,
};

export default user;
