import bcryptjs from 'bcryptjs'

async function hash(password) {
  const rounds = process.env.NODE_ENV === "production" ? 14 : 1;
  const salt = await bcryptjs.genSalt(rounds);
  const saltAndPepper = salt + process.env.PEPPER
  return await bcryptjs.hash(password, saltAndPepper)
}

async function compare(providedPassword, hash) {
  return await bcryptjs.compare(providedPassword, hash);
}

const password = {
  hash,
  compare
}

export default password;