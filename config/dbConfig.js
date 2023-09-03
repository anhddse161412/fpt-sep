require("dotenv").config();

module.exports = {
   // Local host

   // HOST: "localhost",
   // USER: "root",
   // PASSWORD: "admin",
   // DB: "sep",
   // dialect: "mysql",

   // Server
   HOST: process.env.DB_HOST,
   USER: process.env.DB_USER,
   PASSWORD: process.env.DB_PASSWORD,
   DB: process.env.DB_NAME,
   dialect: "mysql",

   pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
   },
};
