import bcryptjs from "bcryptjs";

async function hash(password) {
  const rounds = process.env.NODE_ENV === "production" ? 14 : 1;
  const salt = await bcryptjs.genSalt(rounds);
  const saltAndPepper = salt + process.env.PEPPER;
  return await bcryptjs.hash(password, saltAndPepper);
}

async function compare(providedPassword, storedPassword) {
  return await bcryptjs.compare(providedPassword, storedPassword);
}

const password = {
  hash,
  compare,
};

export default password;
