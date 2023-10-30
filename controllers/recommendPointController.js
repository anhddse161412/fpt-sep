const db = require("../models");

// create main Model
const Job = db.jobs;
const Account = db.accounts;
const Freelancer = db.freelancers;
const Proposal = db.proposals;
const Skill = db.skills;
const FreelancerSkill = db.freelancerSkill;
const JobSkill = db.jobSkill;
const RecommendPoint = db.recommendPoints;

// main work

// Rate Point for every Jobs And Freelancers
const recommendationProposalForJob = async () => {
   const jobs = await Job.findAll({
      include: [
         {
            model: Skill,
            as: "skills",
            attributes: ["id"],
            through: { attributes: [] },
         },
         {
            model: Proposal,
            as: "proposals",
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
                        attributes: ["id"],
                        through: { attributes: [] },
                     }
                  ]
               },
            ]
         }
      ],
      attributes: ["id"],
      where: { status: true }
   });

   jobs.forEach(async job => {
      let jobSkillList = [];
      job.skills.forEach(skill => {
         jobSkillList.push(skill.id)
      });

      job.proposals.forEach(async proposal => {
         let freelancerSkillList = [];
         proposal.freelancers.skills.forEach(skill => {
            freelancerSkillList.push(skill.id)
         });

         let intersection = jobSkillList.filter(x => freelancerSkillList.includes(x));
         let point = intersection.length;

         if (point) {
            let recommendPoint = await RecommendPoint.findOne({
               where: { jobId: job.id, freelancerId: proposal.freelancers.id, },
            })

            await recommendPoint.setDataValue("type", "forProposals")
            await recommendPoint.setDataValue("point", point);
            await recommendPoint.save();
         }
      })
   });
};

// create recommend data for Proposal
const createProposalDataRecommend = async () => {
   const jobs = await Job.findAll({
      include: [
         {
            model: Proposal,
            as: "proposals",
            attributes: ["id"],
            include: [
               {
                  model: Freelancer,
                  as: "freelancers",
                  attributes: ["id"],
               },
            ]
         }
      ],
      attributes: ["id"],
      where: { status: "open" }
   });

   jobs.forEach(async job => {
      job.proposals.forEach(async proposal => {
         const recommendPoint = await RecommendPoint.findOne({
            where: {
               jobId: job.id,
               freelancerId: proposal.freelancers.id,
            },
         });
         recommendPoint.setDataValue("type", "forProposals")
         recommendPoint.save()
      })
   })
}

// rate proposal after create
const rateProposalAfterCreate = async (freelancerId, jobId) => {
   const freelancerSkills = await FreelancerSkill.findAll({
      attributes: ["skillId"],
      where: { freelancerId: freelancerId }
   })

   const jobSkills = await JobSkill.findAll({
      attributes: ["skillId"],
      where: { jobId: jobId }
   })

   let freelancerSkillList = [];
   let jobSkillList = [];

   freelancerSkills.forEach(item => {
      freelancerSkillList.push(item.skillId);
   })

   jobSkills.forEach(item => {
      jobSkillList.push(item.skillId);
   })

   let intersection = jobSkillList.filter(x => freelancerSkillList.includes(x));
   let point = intersection.length;

   await RecommendPoint.create({
      freelancerId: freelancerId,
      jobId: jobId,
      point: point,
      type: "forProposals"
   });
}

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
      where: { id: jobId }
   });

   freelancers.forEach(async freelancer => {
      let jobSkillList = [];
      let freelancerSkillList = [];

      job.skills.forEach(skill => {
         jobSkillList.push(skill.id)
      });

      freelancer.skills.forEach(skill => {
         freelancerSkillList.push(skill.id)
      });


      let intersection = jobSkillList.filter(x => freelancerSkillList.includes(x));
      let point = intersection.length;

      if (point) {
         let recommendPoint = await RecommendPoint.findOne({
            where: { jobId: job.id, freelancerId: freelancer.id, },
         })

         if (recommendPoint) {
            await recommendPoint.setDataValue("point", point);
            await recommendPoint.save();
         }
      }
   });
}

// change recommend after update freelancer skill
const updateRecommendationWhenFreelancerUpdate = async (freelanacerId) => {
   const freelancers = await Freelancer.findOne({
      include: [
         {
            model: Skill,
            as: "skills",
            attributes: ["id"],
            through: { attributes: [] },
         },
      ],
      where: { id: freelanacerId }
   });

   const jobs = await Job.findAll({
      include: [
         {
            model: Skill,
            as: "skills",
            attributes: ["id"],
            through: { attributes: [] },
         },
      ],
      attributes: ["id"],
      where: { status: "open" }
   });

   jobs.forEach(async job => {
      let jobSkillList = [];
      let freelancerSkillList = [];

      job.skills.forEach(skill => {
         jobSkillList.push(skill.id)
      });

      freelancers.skills.forEach(skill => {
         freelancerSkillList.push(skill.id)
      });


      let intersection = jobSkillList.filter(x => freelancerSkillList.includes(x));
      let point = intersection.length;

      if (point) {
         let recommendPoint = await RecommendPoint.findOne({
            where: { jobId: job.id, freelancerId: proposal.freelancers.id, },
         })

         if (recommendPoint) {
            await recommendPoint.setDataValue("point", point);
            await recommendPoint.save();
         }
      }
   });
}

// remove recommendPoint when job is removed
const deleteRecommendPointWhenJobRemoved = async (job) => {
   let jobId = job.id;

   await RecommendPoint.destroy({
      where: { jobId: jobId }
   });
}

// create recommend data for Freelancer
const createDataForFreelancer = async () => {
   const jobs = await Job.findAll({
      attributes: ["id"],
      where: { status: "open" }
   });

   const freelancers = await Freelancer.findAll({
      attributes: ["id"],
   })

   jobs.forEach(async job => {
      freelancers.forEach(async freelancer => {
         await RecommendPoint.findOrCreate({
            where: { jobId: job.id, freelancerId: freelancer.id },
         })
      })
   });
}

//  Job recommendation for freelancer
const recommendationForFreelancer = async () => {
   const jobs = await Job.findAll({
      include: [
         {
            model: Skill,
            as: "skills",
            attributes: ["id"],
            through: { attributes: [] },
         },
      ],
      attributes: ["id"],
      where: { status: "open" }
   });

   const freelancers = await Freelancer.findAll({
      include: [
         {
            model: Skill,
            as: "skills",
            attributes: ["id"],
            through: { attributes: [] },
         },
      ],
      attributes: ["id"],
   })

   jobs.forEach(async job => {
      let jobSkillList = [];
      job.skills.forEach(skill => {
         jobSkillList.push(skill.id)
      });

      freelancers.forEach(async freelancer => {
         let freelancerSkillList = [];

         freelancer.skills.forEach(skill => {
            freelancerSkillList.push(skill.id)
         });

         let intersection = jobSkillList.filter(x => freelancerSkillList.includes(x));
         let point = intersection.length;

         if (point) {
            let recommendPoint = await RecommendPoint.findOne({
               where: { jobId: job.id, freelancerId: freelancer.id, type: "forFreelancers" },
            })

            if (recommendPoint) {
               await recommendPoint.setDataValue("point", point);
               await recommendPoint.save();
            }
         }
      })
   });
};



module.exports = {
   createProposalDataRecommend,
   recommendationProposalForJob,
   updateRecommendationWhenFreelancerUpdate,
   updateRecommendationWhenJobUpdate,
   rateProposalAfterCreate,
   createDataForFreelancer,
   recommendationForFreelancer,
};