const dbConfig = require("../config/dbConfig.js");

const { Sequelize, DataTypes, Op } = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
   host: dbConfig.HOST,
   dialect: dbConfig.dialect,
   operatorsAliases: false,
   timezone: "+07:00",
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
db.jobs = require("./jobModel")(sequelize, DataTypes);
db.clients = require("./clientModel")(sequelize, DataTypes);
db.freelancers = require("./freelancerModel")(sequelize, DataTypes);
db.applications = require("./applicationModel")(sequelize, DataTypes);
db.skills = require("./skillModel")(sequelize, DataTypes);
db.appointments = require("./appointmentModel")(sequelize, DataTypes);
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
// db.categorySubCategory = require('./categorySubCategoryModel')(
//   sequelize,
//   DataTypes
// );
// creation

db.sequelize.sync({ force: false, alter: false }).then(() => {
   console.log("re-sync done!");
});

// 1 to Many Relation

// category self-reference relationship
db.categories.belongsTo(db.categories, {
   as: "categories",
   foreignKey: "parentId",
   constraints: false,
});
db.categories.hasMany(db.categories, {
   as: "subCategories",
   foreignKey: "parentId",
   constraints: false,
});

// db.categories.belongsTo(db.categories, {
//   foreignKey: 'subCategoryId',
//   as: 'subCategories',
//   through: db.categorySubCategory,
// });

// db.categories.belongsToMany(db.categories, {
//   foreignKey: 'categoryId',
//   as: 'categories',
//   through: db.categorySubCategory,
// });

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

// freelancer - application
db.freelancers.hasMany(db.applications, {
   foreignKey: "freelancerId",
   as: "applications",
});

db.applications.belongsTo(db.freelancers, {
   foreignKey: "freelancerId",
   as: "freelancers",
});

// job - application
db.jobs.hasMany(db.applications, {
   foreignKey: "jobId",
   as: "applications",
});

db.applications.belongsTo(db.jobs, {
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

// applications - appointment
db.applications.hasMany(db.appointments, {
   foreignKey: "applicationId",
   as: "appointments",
});

db.appointments.belongsTo(db.applications, {
   foreignKey: "applicationId",
   as: "applications",
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

// transaction - applications
db.applications.hasOne(db.transactions, {
   foreignKey: "applicationId",
   as: "transactions",
});

db.transactions.belongsTo(db.applications, {
   foreignKey: "applicationId",
   as: "application",
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

db.jobs.belongsToMany(db.categories, {
   as: "subcategories",
   through: db.jobSubCategory,
});
db.categories.belongsToMany(db.jobs, {
   as: "jobs",
   through: db.jobSubCategory,
});

db.jobs.belongsToMany(db.skills, { through: db.jobSkill });
db.skills.belongsToMany(db.jobs, { through: db.jobSkill });

db.freelancers.belongsToMany(db.skills, { through: db.freelancerSkill });
db.skills.belongsToMany(db.freelancers, { through: db.freelancerSkill });

module.exports = db;
