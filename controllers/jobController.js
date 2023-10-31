const db = require("../models");
const { Sequelize } = require("sequelize");

// Sequelize operation
const Op = Sequelize.Op;

// create main Model
const Job = db.jobs;
const Account = db.accounts;
const Category = db.categories;
const SubCategory = db.subCategories;
const Client = db.clients;
const Application = db.applications;
const Skill = db.skills;
const Appointment = db.appointments;
const Freelancer = db.freelancers;
const RecommendPoint = db.recommendPoints;
// main work

// 1. create Job

const createJob = async (req, res) => {
   try {
      let info = {
         title: req.body.title,
         description: req.body.description,
         fileAttachment: req.body.fileAttachment,
         applicationSubmitDeadline: req.body.applicationSubmitDeadline,
         lowestIncome: req.body.lowestIncome,
         highestIncome: req.body.highestIncome,
         clientId: req.body.clientId,
         status: req.body.status ? req.body.status : "open",
      };
      let subCategoryList = req.body.subCategory;
      let skillList = req.body.skill;

      const job = await Job.create(info);

      if (subCategoryList) {
         subCategoryList.forEach(async (item) => {
            const subCategory = await SubCategory.findOne({
               where: { name: item },
            });
            subCategory.addJobs(job);
         });
      }
      if (skillList) {
         skillList.forEach(async (item) => {
            let skill = await Skill.findOne({ where: { name: item } });
            if (!skill) {
               skill = await Skill.create({
                  name: item.charAt(0).toUpperCase() + item.slice(1),
               });
               skill.addJobs(job);
            } else {
               skill.addJobs(job);
            }
         });
      }

      res.status(200).send("job Created");
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

// 2. developing freelancer for job
const getAllJob = async (req, res) => {
   try {
      let job = await Job.findAll({
         include: [
            {
               model: Client,
               as: "clients",
               include: [
                  {
                     model: Account,
                     as: "accounts",
                     attributes: ["name", "image"],
                  },
               ],

               attributes: ["id"],
            },
            {
               model: Skill,
               as: "skills",
               attributes: { exclude: ["createdAt", "updatedAt"] },
            },
         ],
         attributes: { exclude: ["createdAt"] },
         order: [["updatedAt", "ASC"]],
      });
      res.status(200).send(job);
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

const getJobById = async (req, res) => {
   try {
      if (!req.query.freelancerId) {
         let job = await Job.findOne({
            include: [
               {
                  model: SubCategory,
                  as: "subcategories",
                  attributes: ["name"],
               },
               {
                  model: Skill,
                  as: "skills",
                  attributes: { exclude: ["createdAt", "updatedAt"] },
               },
               {
                  model: Client,
                  as: "clients",
                  include: [
                     {
                        model: Account,
                        as: "accounts",
                     },
                  ],
               },
               {
                  model: Application,
                  as: "applications",
               },
            ],
            where: { id: req.params.jobID },
         });
         res.status(200).send(job);
      } else {
         let job = await Job.findOne({
            include: [
               {
                  model: Skill,
                  as: "skills",
                  attributes: { exclude: ["createdAt", "updatedAt"] },
               },
               {
                  model: Application,
                  as: "applications",
                  where: { freelancerId: req.query.freelancerId },
               },
               {
                  model: Client,
                  as: "clients",
                  include: [
                     {
                        model: Account,
                        as: "accounts",
                     },
                  ],
               },
            ],
            where: { id: req.params.jobID },
         });

         if (!job) {
            job = await Job.findOne({
               include: [
                  {
                     model: Skill,
                     as: "skills",
                     attributes: { exclude: ["createdAt", "updatedAt"] },
                  },
                  {
                     model: Client,
                     as: "clients",
                     include: [
                        {
                           model: Account,
                           as: "accounts",
                        },
                     ],
                  },
               ],
               where: { id: req.params.jobID },
            });
         }
         res.status(200).send(job);
      }
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

const updateJob = async (req, res) => {
   try {
      let job = await Job.update(req.body, {
         where: { id: req.params.jobID },
      });
      res.status(200).send(job);
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

const getJobWithClientId = async (req, res) => {
   try {
      const data = await Job.findOne({
         include: [
            {
               model: Account,
               as: "accounts",
            },
         ],
         where: { id: req.params.jobID },
      });

      res.status(200).send(data);
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

// Add job to favorite
const addFavoriteJob = async (req, res) => {
   try {
      const job = await Job.findOne({
         where: { id: req.body.jobId },
      });
      const account = await Account.findOne({
         where: { id: req.body.accountId },
      });
      job.addAccount(account);

      res.status(200).send("job favorite added");
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

const removeFavoriteJob = async (req, res) => {
   try {
      const job = await Job.findOne({
         where: { id: req.body.jobId },
      });
      const account = await Account.findOne({
         where: { id: req.body.accountId },
      });
      job.removeAccount(account);

      res.status(200).send("job favorite removed");
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

// apply for job by application
const applyJob = async (req, res) => {
   try {
      const job = await Job.findOne({
         where: { id: req.body.jobId },
      });
      const application = await Application.findOne({
         where: { id: req.body.applicationId },
      });

      await job.addApplication(application).then(async (res) => {
         let applicationCounter = await job.countApplications();
         job.setDataValue("applied", applicationCounter.toString());
         job.save();
      });

      res.status(200).send("applied");
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};
// get job pagination
const paginationJob = async (req, res) => {
   try {
      let limit = Number(req.query.limit) || null;
      let page = Number(req.query.page) || null;

      if (!limit && page) {
         limit = 10;
      } else if (limit && !page) {
         page = 1;
      }

      if (limit && page && (limit <= 0 || page <= 0)) {
         return res.status(400).json({ error: "Invalid limit or page number" });
      }

      let offset = (page - 1) * limit;

      const { count, rows: jobs } = await Job.findAndCountAll({
         include: [
            {
               model: SubCategory,
               as: "subcategories",
               include: [
                  {
                     model: Category,
                     as: "categories",
                     attributes: ["name"],
                  },
               ],
               attributes: ["name"],
            },
            {
               model: Client,
               as: "clients",
               include: [
                  {
                     model: Account,
                     as: "accounts",
                     attributes: ["name", "image"],
                  },
               ],
               attributes: ["id"],
            },
            {
               model: Skill,
               as: "skills",
               attributes: { exclude: ["createdAt", "updatedAt"] },
            },
         ],
         distinct: true,
         where: { status: "open" },
         limit,
         offset,
         order: [["updatedAt", "DESC"]],
      });

      const totalPages = Math.ceil(count / limit);

      res.status(200).json({
         jobs,
         pagination: {
            totalItems: count,
            totalPages,
            currentPage: page,
            itemsPerPage: limit,
         },
      });
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
   }
};

const paginationJobBySubCategoryId = async (req, res) => {
   try {
      let limit = Number(req.query.limit) || null;
      let page = Number(req.query.page) || null;

      if (!limit && page) {
         limit = 10;
      } else if (limit && !page) {
         page = 1;
      }

      if (limit && page && (limit <= 0 || page <= 0)) {
         return res.status(400).json({ error: "Invalid limit or page number" });
      }

      let offset = (page - 1) * limit;

      const { count, rows: jobs } = await Job.findAndCountAll({
         include: [
            {
               model: SubCategory,
               as: "subcategories",
               where: {
                  id: req.params.subCategoryId,
               },
               include: [
                  {
                     model: Category,
                     as: "categories",
                     attributes: ["name"],
                  },
               ],
               attributes: ["name"],
            },
            {
               model: Client,
               as: "clients",
               include: [
                  {
                     model: Account,
                     as: "accounts",
                     attributes: ["name", "image"],
                  },
               ],
               attributes: ["id"],
            },
            {
               model: Skill,
               as: "skills",
               attributes: { exclude: ["createdAt", "updatedAt"] },
            },
         ],
         distinct: true,
         where: { status: "open" },
         limit,
         offset,
         order: [["updatedAt", "ASC"]],
      });

      const totalPages = Math.ceil(count / limit);

      res.status(200).json({
         jobs,
         pagination: {
            totalItems: count,
            totalPages,
            currentPage: page,
            itemsPerPage: limit,
         },
      });
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
   }
};

// get job by category
const getJobBySubCategory = async (req, res) => {
   try {
      const data = await Job.findAll({
         include: [
            {
               model: SubCategory,
               as: "subcategories",
               where: {
                  name: {
                     [db.Op.like]: `%${req.params.subCategory}`,
                  },
               },
               include: [
                  {
                     model: Category,
                     as: "categories",
                     attributes: ["name"],
                  },
               ],
               attributes: ["name"],
            },
         ],
      });

      res.status(200).send(data);
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

// get job by Client Id
const getJobByClientId = async (req, res) => {
   try {
      const jobs = await Job.findAll({
         where: {
            clientId: req.params.clientId,
            status: { [Op.ne]: "delete" },
         },
      });

      res.status(200).send(jobs);
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

// get job by Client Id that have appointment
const getJobHasAppointmentByClientId = async (req, res) => {
   try {
      const jobs = await Job.findAll({
         include: [
            {
               model: Application,
               as: "applications",
               include: [
                  {
                     model: Appointment,
                     as: "appointments",
                     attributes: { exclude: ["createdAt", "updateAt"] },
                     where: { status: "Sent" },
                  },
                  {
                     model: Freelancer,
                     as: "freelancers",
                     include: [
                        {
                           model: Account,
                           as: "accounts",
                           attributes: ["name", "email", "image"],
                        },
                     ],
                     attributes: ["id"],
                  },
               ],
               attributes: ["id"],
               where: { status: "interview" },
            },
         ],
         where: {
            clientId: req.params.clientId,
            status: { [Op.ne]: "delete" },
         },
      });

      res.status(200).send(jobs);
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

// inactive job
const inactiveJob = async (req, res) => {
   try {
      const job = await Job.findOne({
         where: { id: req.params.jobID },
      });

      job.setDataValue("status", "delete");
      job.save();

      res.status(200).send("Xoa cong viec thanh cong!");
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

const checkJobEndDate = async (req, res) => {
   try {
      let message = [];
      let jobs = await Job.findAll({
         attributes: ["applicationSubmitDeadline", "id"],
         where: { status: "open" },
      }).then((res) => {
         res.forEach((item) => {
            if (!compareDates(item.applicationSubmitDeadline)) {
               message.push(`Job id : ${item.id} is expired`);
               item.setDataValue("status", "close");
               item.save();
            }
         });
      });
      if (message.length == 0) {
         message.push("No job is expired today");
      }
      console.log(message);
      message = [];
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

const compareDates = (date) => {
   const currentDate = new Date().getTime();
   let jobDate = new Date(date).getTime();
   if (jobDate < currentDate) {
      return false;
   }
   return true;
};

const closeJob = async (req, res) => {
   try {
      const job = await Job.findOne({
         where: { id: req.params.jobId },
      });

      let dateTime = new Date();

      job.setDataValue("applicationSubmitDeadline", dateTime);
      job.setDataValue("status", "close");
      job.save();

      res.status(200).send(job);
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

const extendJob = async (req, res) => {
   try {
      const job = await Job.findOne({
         where: { id: req.params.jobId },
      });

      let dateTime = new Date();
      dateTime.setDate(dateTime.getDate() + 3);

      job.setDataValue("applicationSubmitDeadline", dateTime);
      job.setDataValue("status", "open");
      job.save();

      res.status(200).send(job);
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

const recommendedJobForFreelancer = async (req, res) => {
   try {
      let limit = 10;

      let recommended = await RecommendPoint.findAll({
         include: [
            {
               model: Job,
               as: "jobs",
               include: [
                  {
                     model: Client,
                     as: "clients",
                     include: [
                        {
                           model: Account,
                           as: "accounts",
                           attributes: ["name", "image"],
                        },
                     ],
                     attributes: ["id"],
                  },
                  {
                     model: Skill,
                     as: "skills",
                     attributes: { exclude: ["createdAt", "updatedAt"] },
                  },
               ],
               where: { status: "open" },
            },
         ],
         attributes: ["point"],
         where: {
            freelancerId: req.params.freelancerId,
            type: "forFreelancers",
            point: { [Op.gt]: 0 },
         },
         order: [["point", "DESC"]],
         limit,
      });
      res.status(200).send(recommended);
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

const paginationJobByName = async (req, res) => {
   try {
      let limit = Number(req.query.limit) || null;
      let page = Number(req.query.page) || null;

      if (!limit && page) {
         limit = 10;
      } else if (limit && !page) {
         page = 1;
      }

      if (limit && page && (limit <= 0 || page <= 0)) {
         return res.status(400).json({ error: "Invalid limit or page number" });
      }

      let offset = (page - 1) * limit;

      const { count, rows: jobs } = await Job.findAndCountAll({
         include: [
            {
               model: SubCategory,
               as: "subcategories",
               include: [
                  {
                     model: Category,
                     as: "categories",
                     attributes: ["name"],
                  },
               ],
               attributes: ["name"],
            },
            {
               model: Client,
               as: "clients",
               include: [
                  {
                     model: Account,
                     as: "accounts",
                     attributes: ["name", "image"],
                  },
               ],
               attributes: ["id"],
            },
            {
               model: Skill,
               as: "skills",
               attributes: { exclude: ["createdAt", "updatedAt"] },
            },
         ],
         distinct: true,
         where: {
            status: true,
            title: {
               [db.Op.like]: `%${req.params.jobName}%`,
            },
         },
         limit,
         offset,
         order: [["updatedAt", "DESC"]],
      });

      const totalPages = Math.ceil(count / limit);

      res.status(200).json({
         jobs,
         pagination: {
            totalItems: count,
            totalPages,
            currentPage: page,
            itemsPerPage: limit,
         },
      });
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
   }
};

module.exports = {
   createJob,
   getJobById,
   getAllJob,
   updateJob,
   getJobWithClientId,
   paginationJob,
   applyJob,
   getJobBySubCategory,
   addFavoriteJob,
   paginationJobBySubCategoryId,
   removeFavoriteJob,
   getJobByClientId,
   getJobHasAppointmentByClientId,
   inactiveJob,
   checkJobEndDate,
   closeJob,
   extendJob,
   recommendedJobForFreelancer,
   paginationJobByName,
};
