const db = require("../models");
const { Sequelize } = require("sequelize");
const { verify } = require("jsonwebtoken");

// Sequelize operation
const Op = Sequelize.Op;

// controller
const notificaitonController = require("./notificationController");

// create main Model
const Job = db.jobs;
const Account = db.accounts;
const Category = db.categories;

const Client = db.clients;
const Application = db.applications;
const Skill = db.skills;
const Appointment = db.appointments;
const Freelancer = db.freelancers;
const RecommendPoint = db.recommendPoints;
const JobSkill = db.jobSkill;
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
            const subCategory = await Category.findOne({
               where: { name: item, parentId: { [Op.not]: null } },
            });
            subCategory.addJobs(job);
         });
      }
      if (skillList) {
         skillList.forEach(async (item) => {
            let skill = await Skill.findOne({ where: { name: item.name } });
            if (!skill) {
               skill = await Skill.create({
                  name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
               });
               await JobSkill.create({
                  jobId: job.id,
                  level: item.level,
                  skillId: skill.id
               })
            } else {
               await JobSkill.create({
                  jobId: job.id,
                  level: item.level,
                  skillId: skill.id
               })
            }
         });
      }

      res.status(200).send("Tạo Công việc thành công!");
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
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
                     attributes: ["id", "name", "image"],
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
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const getJobById = async (req, res) => {
   try {
      if (!req.query.freelancerId) {
         let job = await Job.findOne({
            include: [
               {
                  model: Category,
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
                  include: [
                     {
                        model: Freelancer,
                        as: "freelancers",
                        attributes: ["id", "accountId"],
                     },
                  ],
               },
            ],
            where: { id: req.params.jobID },
         });
         if (job) {
            res.status(200).send(job);
         } else {
            res.status(400).json({ message: "Công việc này không tồn tại!" });
         }
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
         if (job) {
            res.status(200).send(job);
         } else {
            res.status(400).json({ message: "Công việc này không tồn tại!" });
         }
      }
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const updateJob = async (req, res) => {
   try {
      await Job.update(req.body, {
         where: { id: req.params.jobID },
      });

      const job = await Job.findOne({
         include: [
            {
               model: Skill,
               as: "skills",
               attributes: { include: ["name"] },
            },
            {
               model: Category,
               as: "subcategories",
               attributes: { include: ["name"] },
            }

         ],
         where: { id: req.params.jobID },
      });

      let newSkills = req.body.skill;
      let subCategoryList = [];

      req.body.subCategory.forEach(item => {
         if (item.value) {
            subCategoryList.push(item.value)
         } else {
            subCategoryList.push(item)
         }
      });

      if (subCategoryList) {
         const jobCategories = [];

         job.subcategories.forEach(async item => {
            jobCategories.push(item.name)
         });

         // old and new
         let difference = jobCategories.filter(x => !subCategoryList.includes(x));
         if (difference.length != 0) {
            difference.forEach(async (item) => {
               const subCategory = await Category.findOne({
                  where: { name: item, parentId: { [Op.not]: null } },
               });
               await subCategory.removeJobs(job);
            });
         };

         // new and old
         difference = subCategoryList.filter(x => !jobCategories.includes(x));
         if (difference.length != 0) {
            difference.forEach(async (item) => {
               const subCategory = await Category.findOne({
                  where: { name: item, parentId: { [Op.not]: null } },
               });
               await subCategory.addJobs(job);
            });
         };
      };

      if (newSkills.length > 0) {
         let jobSkills = [];

         job.skills.forEach(async jobSkill => {
            jobSkills.push(jobSkill);
         });

         if (jobSkills.length > 0) {
            jobSkills.forEach(async (oldSkill, index) => {
               newSkills.forEach(async newSkill => {
                  if (newSkill.name == oldSkill.name) {
                     jobSkills.splice(index, 1);
                     const jobSkill = await JobSkill.findOne({
                        where: {
                           jobId: job.id,
                           skillId: oldSkill.id,
                        },
                     });
                     jobSkill.setDataValue("level", newSkill.level);
                     jobSkill.save();
                  }
                  else {
                     let skill = await Skill.findOne({
                        where: {
                           name: {
                              [db.Op.like]: `%${newSkill.name}`,
                           }
                        }
                     });
                     if (!skill) {
                        skill = await Skill.create({
                           name: newSkill.name.charAt(0).toUpperCase() + newSkill.name.slice(1),
                        });
                        await JobSkill.create({
                           jobId: job.id,
                           level: newSkill.level,
                           skillId: skill.id
                        })
                     } else {
                        await JobSkill.create({
                           jobId: job.id,
                           level: newSkill.level,
                           skillId: skill.id
                        })
                     }
                  }
               });
            });
            jobSkills.forEach(async oldSkill => {
               await JobSkill.destroy({
                  where: {
                     jobSkillId: oldSkill.jobskill.jobSkillId
                  },
               })
            })
         } else {
            newSkills.forEach(async newSkill => {
               let skill = await Skill.findOne({
                  where: {
                     name: {
                        [db.Op.like]: `%${newSkill.name}`,
                     }
                  }
               });
               if (!skill) {
                  skill = await Skill.create({
                     name: newSkill.name.charAt(0).toUpperCase() + newSkill.name.slice(1),
                  });
                  await JobSkill.create({
                     jobId: job.id,
                     level: newSkill.level,
                     skillId: skill.id
                  })
               } else {
                  await JobSkill.create({
                     jobId: job.id,
                     level: newSkill.level,
                     skillId: skill.id
                  })
               }
            });
         }
      } else {
         JobSkill.destroy({
            where: {
               jobId: job.id,
            },
         })
      }

      res.status(200).send("Cập nhật thành công!");
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
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
      console.error(error);
      res.status(400).json({ message: error.toString() });
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

      res.status(200).send("Đã thêm vào danh sách ưu thích!");
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
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
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

// apply for job by application
const applyJob = async (req, res) => {
   try {
      const job = await Job.findOne({
         include: [
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
         where: { id: req.body.jobId },
      });
      const application = await Application.findOne({
         include: [
            {
               model: Freelancer,
               as: "freelancers",

               include: [
                  {
                     model: Account,
                     as: "accounts",
                     attributes: ["name", "image", "id"],
                  },
               ],
               attributes: ["id"],
            },
         ],
         where: { id: req.body.applicationId },
      });

      await job.addApplication(application).then(async (res) => {
         let applicationCounter = await job.countApplications();
         job.setDataValue("applied", applicationCounter.toString());
         job.save();
      });
      // let notification = await notificaitonController.createNotificationInfo(
      //    job.clients.accounts.id,
      //    `Your job has a new application`,
      //    `Your job has new application from ${application.freelancers.accounts.name}`
      // );
      res.status(200).send("applied");
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};
// get job pagination
const paginationJob = async (req, res) => {
   try {
      let user;
      let token = req.get("authorization");
      if (token) {
         token = token.slice(7);
         verify(token, process.env.JWT_KEY, (err, decoded) => {
            if (err) {
            } else {
               user = decoded;
            }
         });
      }

      let limit = Number(req.query.limit) || null;
      let page = Number(req.query.page) || null;

      if (!limit && page) {
         limit = 10;
      } else if (limit && !page) {
         page = 1;
      }

      if (limit && page && (limit <= 0 || page <= 0)) {
         return res
            .status(400)
            .json({ message: "Invalid limit or page number" });
      }

      let offset = (page - 1) * limit;

      if (user && user.result.role == "admin") {
         console.log("hahahaha");
         const { count, rows: jobs } = await Job.findAndCountAll({
            include: [
               {
                  model: Category,
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
                        attributes: ["id", "name", "image"],
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
            where: { status: { [Op.ne]: "delete" } },
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
      } else {
         const { count, rows: jobs } = await Job.findAndCountAll({
            include: [
               {
                  model: Category,
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
                        attributes: ["id", "name", "image"],
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
      }
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
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
         return res
            .status(400)
            .json({ message: "Invalid limit or page number" });
      }

      let offset = (page - 1) * limit;

      const { count, rows: jobs } = await Job.findAndCountAll({
         include: [
            {
               model: Category,
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
                     attributes: ["id", "name", "image"],
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
      res.status(400).json({ message: error.toString() });
   }
};

// get job by category
const getJobBySubCategory = async (req, res) => {
   try {
      const data = await Job.findAll({
         include: [
            {
               model: Category,
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
      console.error(error);
      res.status(400).json({ message: error.toString() });
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
         order: [["createdAt", "DESC"]],
      });

      res.status(200).send(jobs);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
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
                           attributes: ["id", "name", "email", "image"],
                        },
                     ],
                     attributes: ["id"],
                  },
               ],
               attributes: ["id", "status"],
               where: { status: { [Op.not]: null } },
            },
         ],
         where: {
            clientId: req.params.clientId,
            status: { [Op.ne]: "delete" },
         },
      });

      res.status(200).send(jobs);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
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

      res.status(200).send("Xóa công việc thành công!");
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
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
         if (message.length == 0) {
            message.push("No job is expired today");
         }
         console.log(message);
         message = [];
      });
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
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
      console.error(error);
      res.status(400).json({ message: error.toString() });
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
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const recommendedJobForFreelancer = async (req, res) => {
   try {
      let limit = Number(req.query.limit) || 10;
      let page = Number(req.query.page) || 1;

      if (limit && page && (limit <= 0 || page <= 0)) {
         return res
            .status(400)
            .json({ message: "Invalid limit or page number" });
      }

      let offset = (page - 1) * limit;

      const { count, rows: recommendeds } =
         await RecommendPoint.findAndCountAll({
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
                              attributes: ["id", "name", "image"],
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
               {
                  model: Freelancer,
                  as: "freelancers",
                  where: { accountId: req.params.accountId },
                  attributes: [],
               },
            ],
            attributes: ["point"],
            where: {
               type: "forFreelancers",
               point: { [Op.gt]: 0 },
            },
            distinct: true,
            offset,
            limit,
            order: [["point", "DESC"]],
         });

      const totalPages = Math.ceil(count / limit);

      res.status(200).json({
         recommendeds,
         pagination: {
            totalItems: count,
            totalPages,
            currentPage: page,
            itemsPerPage: limit,
         },
      });
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
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
         return res
            .status(400)
            .json({ message: "Invalid limit or page number" });
      }

      let offset = (page - 1) * limit;

      const { count, rows: jobs } = await Job.findAndCountAll({
         include: [
            {
               model: Category,
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
                     attributes: ["id", "name", "image"],
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
            status: "open",
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
      res.status(400).json({ message: error.toString() });
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
