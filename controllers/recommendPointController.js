const db = require("../models");
const { Sequelize } = require("sequelize");

// create main Model
const Job = db.jobs;
const Freelancer = db.freelancers;
const Application = db.applications;
const Skill = db.skills;
const FreelancerSkill = db.freelancerSkill;
const JobSkill = db.jobSkill;
const RecommendPoint = db.recommendPoints;

// Sequelize operation
const Op = Sequelize.Op;

// level
const levelPoint = {
   "Cơ bản": 1,
   "Trung cấp": 2,
   "Thông thạo": 3,
};

// main work

// Rate Point for every Jobs And Freelancers
const recommendationApplicationForJob = async () => {
   const jobs = await Job.findAll({
      include: [
         {
            model: Skill,
            as: "skills",
            attributes: ["id", "name"],
            through: { attributes: ["level"] },
         },
         {
            model: Application,
            as: "applications",
            attributes: ["id"],
            include: [
               {
                  model: Freelancer,
                  as: "freelancers",
                  attributes: ["id"],
                  include: [
                     {
                        model: Skill,
                        as: "skills",
                        attributes: ["id", "name"],
                        through: { attributes: ["level"] },
                     },
                  ],
               },
            ],
         },
      ],
      attributes: ["id"],
      where: { status: "open" },
   });

   jobs.forEach(async (job) => {
      job.applications.forEach(async (application) => {
         let point = 0;

         job.skills.forEach((jobSkills) => {
            application.freelancers.skills.forEach((freelancerSkills) => {
               if (jobSkills.id == freelancerSkills.id) {
                  if (levelPoint[freelancerSkills.freelancerskill.level] >=
                     levelPoint[jobSkills.jobskill.level]) {
                     point += 1;
                  } else {
                     point += 0.5;
                  }
               }
            });
         });

         let recommendPoint = await RecommendPoint.findOne({
            where: {
               jobId: job.id,
               freelancerId: application.freelancers.id,
            },
         });

         await recommendPoint.setDataValue("type", "forApplications");
         await recommendPoint.setDataValue("point", point);
         await recommendPoint.save();
      });
   });
};

// create recommend data for Application
const createApplicationDataRecommend = async () => {
   const jobs = await Job.findAll({
      include: [
         {
            model: Application,
            as: "applications",
            attributes: ["id"],
            include: [
               {
                  model: Freelancer,
                  as: "freelancers",
                  attributes: ["id"],
               },
            ],
         },
      ],
      attributes: ["id"],
      where: { status: "open" },
   });

   jobs.forEach(async (job) => {
      job.applications.forEach(async (application) => {
         const recommendPoint = await RecommendPoint.findOne({
            where: {
               jobId: job.id,
               freelancerId: application.freelancers.id,
            },
         });
         recommendPoint.setDataValue("type", "forApplications");
         recommendPoint.save();
      });
   });
};

// rate application after create
const rateApplicationAfterCreate = async (freelancerId, jobId) => {
   const freelancerSkills = await FreelancerSkill.findAll({
      where: { freelancerId: freelancerId },
   });

   const jobSkills = await JobSkill.findAll({
      where: { jobId: jobId },
   });

   let point = 0;

   freelancerSkills.forEach(freelancerSkill => {
      jobSkills.forEach(jobSkill => {
         if (freelancerSkill.skillId == jobSkill.skillId) {
            if (levelPoint[freelancerSkill.level] >=
               levelPoint[jobSkill.level]) {
               point = point + 1;
            } else {
               point = point + 0.5;
            }
         }
      })
   })

   const recommendPoint = await RecommendPoint.create({
      freelancerId: freelancerId,
      jobId: jobId,
   });

   recommendPoint.setDataValue("point", point);
   recommendPoint.setDataValue("type", "forApplications");
   recommendPoint.save();
};

// change recommend after update job
const updateRecommendationWhenJobUpdate = async (jobId) => {
   const freelancers = await Freelancer.findOne({
      include: [
         {
            model: Skill,
            as: "skills",
            attributes: ["id"],
            through: { attributes: [] },
         },
      ],
   });

   const job = await Job.findAll({
      include: [
         {
            model: Skill,
            as: "skills",
            attributes: ["id"],
            through: { attributes: [] },
         },
      ],
      attributes: ["id"],
      where: { id: jobId },
   });

   freelancers.forEach(async (freelancer) => {
      let jobSkillList = [];
      let freelancerSkillList = [];

      job.skills.forEach((skill) => {
         jobSkillList.push(skill.id);
      });

      freelancer.skills.forEach((skill) => {
         freelancerSkillList.push(skill.id);
      });

      let intersection = jobSkillList.filter((x) =>
         freelancerSkillList.includes(x)
      );
      let point = intersection.length;

      if (point) {
         let recommendPoint = await RecommendPoint.findOne({
            where: { jobId: job.id, freelancerId: freelancer.id },
         });

         if (recommendPoint) {
            await recommendPoint.setDataValue("point", point);
            await recommendPoint.save();
         }
      }
   });
};

// change recommend after update freelancer skill
const updateRecommendationWhenFreelancerUpdate = async (freelanacerId) => {
   const freelancers = await Freelancer.findOne({
      include: [
         {
            model: Skill,
            as: "skills",
            attributes: ["id"],
            through: { attributes: ["level"] },
         },
      ],
      where: { id: freelanacerId },
   });

   const jobs = await Job.findAll({
      include: [
         {
            model: Skill,
            as: "skills",
            attributes: ["id"],
            through: { attributes: ["level"] },
         },
      ],
      attributes: ["id"],
      where: { status: "open" },
   });

   jobs.forEach(async (job) => {
      let jobSkillList = [];
      let freelancerSkillList = [];

      job.skills.forEach((skill) => {
         jobSkillList.push(skill.id);
      });

      freelancers.skills.forEach((skill) => {
         freelancerSkillList.push(skill.id);
      });

      let intersection = jobSkillList.filter((x) =>
         freelancerSkillList.includes(x)
      );
      let point = intersection.length;

      if (point) {
         let recommendPoint = await RecommendPoint.findOne({
            where: { jobId: job.id, freelancerId: freelancers.id },
         });

         if (recommendPoint) {
            await recommendPoint.setDataValue("point", point);
            await recommendPoint.save();
         }
      }
   });
};

// remove recommendPoint when job is removed
const deleteRecommendPointWhenJobRemoved = async (job) => {
   let jobId = job.id;

   await RecommendPoint.destroy({
      where: { jobId: jobId },
   });
};

// create recommend data for Freelancer
const createDataForFreelancer = async () => {
   const jobs = await Job.findAll({
      attributes: ["id"],
      where: { status: "open" },
   });

   const freelancers = await Freelancer.findAll({
      attributes: ["id"],
   });

   jobs.forEach(async (job) => {
      freelancers.forEach(async (freelancer) => {
         await RecommendPoint.findOrCreate({
            where: { jobId: job.id, freelancerId: freelancer.id },
         });
      });
   });
};

//  Job recommendation for freelancer
const recommendationForFreelancer = async () => {
   const jobs = await Job.findAll({
      include: [
         {
            model: Skill,
            as: "skills",
            attributes: ["id"],
            through: { attributes: ["level"] },
         },
      ],
      attributes: ["id"],
      where: { status: "open" },
   });

   const freelancers = await Freelancer.findAll({
      include: [
         {
            model: Skill,
            as: "skills",
            attributes: ["id"],
            through: { attributes: ["level"] },
         },
      ],
      attributes: ["id"],
   });

   jobs.forEach(async (job) => {
      freelancers.forEach(async (freelancer) => {
         let point = 0;

         job.skills.forEach((jobSkills) => {
            freelancer.skills.forEach((freelancerSkills) => {
               if (jobSkills.id == freelancerSkills.id) {
                  if (levelPoint[freelancerSkills.freelancerskill.level] >=
                     levelPoint[jobSkills.jobskill.level]) {
                     point += 1;
                  } else {
                     point += 0.5;
                  }
               }
            });
         });

         if (point > 0) {
            let recommendPoint = await RecommendPoint.findOne({
               where: {
                  jobId: job.id,
                  freelancerId: freelancer.id,
                  type: "forFreelancers",
               },
            });

            if (recommendPoint) {
               await recommendPoint.setDataValue("point", point);
               await recommendPoint.save();
            }
         }
      });
   });
};

// check close and delete job
const removeRecommendData = async () => {
   const jobs = await Job.findAll({
      attributes: ["id"],
      where: { status: { [Op.ne]: "open" } },
   })

   jobs.forEach(job => {
      RecommendPoint.destroy({
         where: {
            jobId: job.id,
            type: "forFreelancers",
         }
      })
   })
}

module.exports = {
   createApplicationDataRecommend,
   recommendationApplicationForJob,
   updateRecommendationWhenFreelancerUpdate,
   updateRecommendationWhenJobUpdate,
   rateApplicationAfterCreate,
   createDataForFreelancer,
   recommendationForFreelancer,
   removeRecommendData,
};
