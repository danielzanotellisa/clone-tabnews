import database from "infra/database";
import { ValidationError } from "infra/errors";

async function create(data) {
  
  await validateUniqueEmail(data.email);
  await validateUniqueUserName(data.username);
  
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
      values: [userEmail]
    })
    
    if (results.rowCount > 0) {
      throw new ValidationError({action:"Utilize um email diferente", message:"O email utilizado ja está em uso"})
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
      values: [userName]
    })
    
    if (results.rowCount > 0) {
      throw new ValidationError({action:"Utilize um nome de usuário diferente", message:"O nome de usuário ja está em uso"})
    }
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
        values: [data.username, data.email, data.password]
      })
    return userCreated.rows[0];
  }
}

const user = {
  create
}

export default user;