const dbConfig = require("../config/dbConfig.js");

const { Sequelize, DataTypes, Op } = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
   host: dbConfig.HOST,
   dialect: dbConfig.dialect,
   operatorsAliases: false,

   pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle,
   },
});

sequelize
   .authenticate()
   .then(() => {
      console.log("connected..");
   })
   .catch((err) => {
      console.log("Error" + err);
   });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Op = Op;

// model
db.accounts = require("./accountModel")(sequelize, DataTypes);
db.categories = require("./categoryModel")(sequelize, DataTypes);
db.subCategories = require("./subCategoryModel")(sequelize, DataTypes);
db.jobs = require("./jobModel")(sequelize, DataTypes);
db.clients = require("./clientModel")(sequelize, DataTypes);
db.freelancers = require("./freelancerModel")(sequelize, DataTypes);
db.proposals = require("./proposalModel")(sequelize, DataTypes);
db.skills = require("./skillModel")(sequelize, DataTypes);
db.appointments = require("./AppointmentModel")(sequelize, DataTypes);

// many many model
db.jobSubCategory = require("./jobSubCategoryModel")(sequelize, DataTypes);
db.favorite = require("./favoriteModel")(sequelize, DataTypes);
db.jobSkill = require("./jobSkillModel")(sequelize, DataTypes);
db.freelancerSkill = require("./freelancerSkillModel")(sequelize, DataTypes);
// creation

db.sequelize.sync({ force: false, alter: true }).then(() => {
   console.log("re-sync done!");
});

// 1 to Many Relation
// category_subcategory
db.categories.hasMany(db.subCategories, {
   foreignKey: "categoryId",
   as: "subCategories",
});

db.subCategories.belongsTo(db.categories, {
   foreignKey: "categoryId",
   as: "categories",
});

// account_client
db.accounts.hasOne(db.clients, {
   foreignKey: "accountId",
   as: "clients",
});

db.clients.belongsTo(db.accounts, {
   foreignKey: "accountId",
   as: "accounts",
});

// account_freelancer
db.accounts.hasOne(db.freelancers, {
   foreignKey: "accountId",
   as: "freelancers",
});

db.freelancers.belongsTo(db.accounts, {
   foreignKey: "accountId",
   as: "accounts",
});

// job_client
db.clients.hasMany(db.jobs, {
   foreignKey: "clientId",
   as: "jobs",
});

db.jobs.belongsTo(db.clients, {
   foreignKey: "clientId",
   as: "clients",
});

// job_freelancer

// freelancer - proposal
db.freelancers.hasMany(db.proposals, {
   foreignKey: "freelancerId",
   as: "proposals",
});

db.proposals.belongsTo(db.freelancers, {
   foreignKey: "freelancerId",
   as: "freelancers",
});

// job - proposal
db.jobs.hasMany(db.proposals, {
   foreignKey: "jobId",
   as: "proposals",
});

db.proposals.belongsTo(db.jobs, {
   foreignKey: "jobId",
   as: "jobs",
});

// client - appointment
db.clients.hasMany(db.appointments, {
   foreignKey: "clientId",
   as: "appointments",
});

db.appointments.belongsTo(db.clients, {
   foreignKey: "clientId",
   as: "clients",
});

// freelancer - appointment
db.jobs.hasMany(db.appointments, {
   foreignKey: "jobId",
   as: "appointments",
});

db.appointments.belongsTo(db.jobs, {
   foreignKey: "jobId",
   as: "jobs",
});
// Many to Many relation
db.jobs.belongsToMany(db.accounts, { through: db.favorite });
db.accounts.belongsToMany(db.jobs, { through: db.favorite });

db.jobs.belongsToMany(db.subCategories, { through: db.jobSubCategory });
db.subCategories.belongsToMany(db.jobs, { through: db.jobSubCategory });

db.jobs.belongsToMany(db.skills, { through: db.jobSkill });
db.skills.belongsToMany(db.jobs, { through: db.jobSkill });

db.freelancers.belongsToMany(db.skills, { through: db.freelancerSkill });
db.skills.belongsToMany(db.freelancers, { through: db.freelancerSkill });

module.exports = db;
