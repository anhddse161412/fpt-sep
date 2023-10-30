const dbConfig = require("../config/dbConfig.js");

const { Sequelize, DataTypes, Op } = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
   host: dbConfig.HOST,
   dialect: dbConfig.dialect,
   operatorsAliases: false,
   port: 25060,
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
db.certificates = require("./certificateModel")(sequelize, DataTypes);
db.recommendPoints = require("./recommendPoint.js")(sequelize, DataTypes);
db.payments = require("./paymentModel")(sequelize, DataTypes);
db.transactions = require("./transactionModel")(sequelize, DataTypes);
db.notifications = require("./notificationModel")(sequelize, DataTypes);
db.languages = require("./languageModel.js")(sequelize, DataTypes);

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

// freelancer - certificate
db.freelancers.hasMany(db.certificates, {
   foreignKey: "freelancerId",
   as: "certificates",
});

db.certificates.belongsTo(db.freelancers, {
   foreignKey: "freelancerId",
   as: "freelancers",
});

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

// proposals - appointment
db.proposals.hasMany(db.appointments, {
   foreignKey: "proposalId",
   as: "appointments",
});

db.appointments.belongsTo(db.proposals, {
   foreignKey: "proposalId",
   as: "proposals",
});

// freelancer - recommendPoint
db.freelancers.hasMany(db.recommendPoints, {
   foreignKey: "freelancerId",
   as: "recommendPoints",
});

db.recommendPoints.belongsTo(db.freelancers, {
   foreignKey: "freelancerId",
   as: "freelancers",
});

// job - recommendPoint
db.jobs.hasMany(db.recommendPoints, {
   foreignKey: "jobId",
   as: "recommendPoints",
});

db.recommendPoints.belongsTo(db.jobs, {
   foreignKey: "jobId",
   as: "jobs",
});

// account - payment
db.clients.hasMany(db.payments, {
   foreignKey: "clientId",
   as: "payments",
});

db.payments.belongsTo(db.clients, {
   foreignKey: "clientId",
   as: "clients",
});

// transaction - payment
db.payments.hasOne(db.transactions, {
   foreignKey: "paymentId",
   as: "transactions",
});

db.transactions.belongsTo(db.payments, {
   foreignKey: "paymentId",
   as: "payments",
});

// transaction - proposals
db.proposals.hasOne(db.transactions, {
   foreignKey: "proposalId",
   as: "transactions",
});

db.transactions.belongsTo(db.proposals, {
   foreignKey: "proposalId",
   as: "proposal",
});

// freelancer - language
db.freelancers.hasMany(db.languages, {
   foreignKey: "freelancerId",
   as: "language",
});

db.languages.belongsTo(db.freelancers, {
   foreignKey: "freelancerId",
   as: "freelancers",
});

// account - notification
db.accounts.hasMany(db.notifications, {
   foreignKey: "accountId",
   as: "notifications",
});

db.notifications.belongsTo(db.accounts, {
   foreignKey: "accountId",
   as: "accounts",
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
