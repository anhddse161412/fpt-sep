const db = require("../models");

// image Upload

// create main Model
const Job = db.jobs;
const Account = db.accounts;
const Category = db.categories;
const SubCategory = db.subCategories;
const Client = db.clients;
const Proposal = db.proposals;
const Skill = db.skills;
// main work

// 1. create Job

const createJob = async (req, res) => {
   try {
      let info = {
         title: req.body.title,
         description: req.body.description,
         fileAttachment: req.body.fileAttachment,
         proposalSubmitDeadline: req.body.proposalSubmitDeadline,
         lowestIncome: req.body.lowestIncome,
         highestIncome: req.body.highestIncome,
         clientId: req.body.clientId,
         status: req.body.status ? req.body.status : false,
      };
      let subCategoryList = req.body.subCategory;
      let skillList = req.body.skill;

      const job = await Job.create(info);

      if (subCategoryList) {
         subCategoryList.forEach(async (item) => {
            const subCategory = await SubCategory.findOne({ name: item });
            subCategory.addJobs(job);
         });
      }
      if (skillList) {
         skillList.forEach(async (item) => {
            const skill = await Skill.findOne({ name: item });
            skill.addJobs(job);
         });
      }

      console.log(Job);
      res.status(200).send("job Created");
   } catch (error) {
      console.log(error);
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
   }
};

const getJobById = async (req, res) => {
   try {
      let job = await Job.findOne({
         where: { id: req.params.jobID },
      });
      res.status(200).send(job);
   } catch (error) {
      console.log(error);
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
   }
};

const getJobWithClientId = async (req, res) => {
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
};

// Add job to favorite
const addFavoriteJob = async (req, res) => {
   const job = await Job.findOne({
      where: { id: req.body.jobId },
   });
   const account = await Account.findOne({
      where: { id: req.body.accountId },
   });
   job.addAccount(account);

   res.status(200).send("job favorite added");
};

const removeFavoriteJob = async (req, res) => {
   const job = await Job.findOne({
      where: { id: req.body.jobId },
   });
   const account = await Account.findOne({
      where: { id: req.body.accountId },
   });
   job.removeAccount(account);

   res.status(200).send("job favorite removed");
};

// apply for job by proposal
const applyJob = async (req, res) => {
   const job = await Job.findOne({
      where: { id: req.body.jobId },
   });
   const proposal = await Proposal.findOne({
      where: { id: req.body.proposalId },
   });

   await job.addProposal(proposal).then(async (res) => {
      let proposalCounter = await job.countProposals();
      job.setDataValue("applied", proposalCounter.toString());
      job.save();
   });

   res.status(200).send("applied");
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
         where: { status: true },
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
// const getJobByCategory = async (req, res) => {
//    const data = await Job.findAll({
//       include: [
//          {
//             model: Category,
//             as: "categorys",
//             where: {
//                name: {
//                   [db.Op.like]: `%${req.body.categoryName}`,
//                },
//             },
//          },
//       ],
//    });

//    res.status(200).send(data);
// };

// get job by category
const getJobBySubCategory = async (req, res) => {
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
};
