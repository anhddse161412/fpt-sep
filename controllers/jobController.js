const db = require("../models");

// image Upload

// create main Model
const Job = db.jobs;
const Account = db.accounts;
const Category = db.categorys;
const SubCategory = db.subCategorys;
const Client = db.clients;
const Favorite = db.favorite;
const Freelancer = db.freelancers;
const Proposal = db.proposals;
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
         skillSets: req.body.skillSets,
         applied: req.body.applied,
         client_id: req.body.client_id,
         status: req.body.status ? req.body.status : false,
      };
      subCategoryList = req.body.subCategory;

      const job = await Job.create(info);
      subCategoryList.forEach(async (item) => {
         const subCategory = await SubCategory.findOne({ name: item });
         subCategory.addJobs(job);
      });
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
               attributes: { exclude: ["createdAt", "updatedAt"] },
            },
         ],
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

   res.status(200).send("job favorite add");
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
   reqLimit = Number(req.query.limit);
   reqPage = Number(req.query.page);

   let limit = reqLimit ? reqLimit : 10;
   let page = reqPage ? reqPage : 1;

   let offset = 0 + (page - 1) * limit;
   const job = await Job.findAndCountAll({
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
            attributes: { exclude: ["createdAt", "updatedAt"] },
         },
      ],
      offset: offset,
      limit: limit,
      order: [["updatedAt", "ASC"]],
   });

   res.status(200).send(job);
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
                  as: "categorys",
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
   addFavoriteJob,
   paginationJob,
   applyJob,
   getJobBySubCategory,
};
