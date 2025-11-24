const dotenv = require("dotenv");
const path = require("path");

module.exports = async () => {
  dotenv.config({ path: path.resolve(__dirname, "./.env.development") });
};
