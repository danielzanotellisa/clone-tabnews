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
  injectDefaultFeaturesInObject(data);

  const newUser = await runInsertQuery(data);
  return newUser;

  async function runInsertQuery(data) {
    const userCreated = await database.query({
      text: `
          INSERT INTO users 
            (username, email, password, features) 
          VALUES 
            ($1, $2, $3, $4)
          RETURNING
            *
          ;`,
      values: [data.username, data.email, data.password, data.features],
    });
    return userCreated.rows[0];
  }

  function injectDefaultFeaturesInObject(data) {
    data.features = ["read:activation_token"];
  }
}

async function findOneById(id) {
  const userFound = await runSelectQuery(id);
  return userFound;

  async function runSelectQuery(id) {
    const user = await database.query({
      text: `
      SELECT
        id, username, email, created_at, updated_at
      FROM
        users
      WHERE
        id = $1
      LIMIT 
        1
    ;`,
      values: [id],
    });
    if (user.rowCount < 1) {
      throw new UserNotFound({
        action: "Verifique se o id do usuário está correto",
        message: "Usuário informado não existe",
      });
    }

    return user.rows[0];
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

async function findOneByEmail(email) {
  const userFound = await runSelectQuery(email);

  async function runSelectQuery(email) {
    const user = await database.query({
      text: `
      SELECT
        *
      FROM
        users
      WHERE
        LOWER(email) = LOWER($1)
      LIMIT 
        1
    ;`,
      values: [email],
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

async function setFeatures(userId, features) {
  const updatedUser = await runUpdateQuery(userId, features);
  return updatedUser;

  async function runUpdateQuery(userId) {
    const user = await database.query({
      text: `
        UPDATE 
          users
        SET 
          features = $2,
          updated_at = timezone('utc', now())
        WHERE 
          id = $1
        RETURNING
          *
      ;`,
      values: [userId, features],
    });
    return user.rows[0];
  }
}

const user = {
  create,
  findOneByUsername,
  findOneByEmail,
  findOneById,
  update,
  setFeatures,
};

export default user;
