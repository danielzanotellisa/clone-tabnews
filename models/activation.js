import email from "infra/email.js";
import database from "infra/database.js";
import webserver from "infra/webserver.js";

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000;
async function sendEmailToUser(user, activationToken) {
  await email.send({
    from: "TabRacing <contato@tabracing.com.br>",
    to: user.email,
    subject: "Ative seu cadastro no TabRacing",
    text: `Olá ${user.username},\n\nAtive seu cadastro no TabRacing clicando no link abaixo:\n\n${webserver.getOrigin()}/cadastro/ativar?token=${activationToken.id}\n\nObrigado por se cadastrar!`,
  });
}

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const newToken = await runInsertQuery(userId, expiresAt);
  return newToken;

  async function runInsertQuery(userId, expiresAt) {
    const tokenCreated = await database.query({
      text: `
          INSERT INTO user_activation_tokens 
            (user_id, expirest_at) 
          VALUES 
            ($1, $2)
          RETURNING
            *
          ;`,
      values: [userId, expiresAt],
    });
    return tokenCreated.rows[0];
  }
}

async function findOneByUserId(userId) {
  const tokenFound = await runSelectQuery(userId);
  return tokenFound;

  async function runSelectQuery(userId) {
    const token = await database.query({
      text: `
      SELECT
        *
      FROM
        user_activation_tokens
      WHERE
        user_id = $1
      LIMIT
        1
    ;`,
      values: [userId],
    });
    return token.rows[0];
  }
}

const activation = {
  sendEmailToUser,
  create,
  findOneByUserId,
};

export default activation;
