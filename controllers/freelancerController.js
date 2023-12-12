const db = require("../models");

// Controller
const RecommendPointController = require('./recommendPointController');


// create main Model
const Account = db.accounts;
const Freelancer = db.freelancers;
const Skill = db.skills;
const Certificate = db.certificates;
const Language = db.languages;
const FreelancerSkill = db.freelancerSkill;
// main work

// 1. get all freelancer
const getAllFreelancer = async (req, res) => {
   try {
      let freelancers = await Freelancer.findAll({
         include: [
            {
               model: Account,
               as: "accounts",
            },
         ],
      });
      res.status(200).send(freelancers);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

// get freelancer by ID
const getFreelancerById = async (req, res) => {
   try {
      let freelancer = await Freelancer.findOne({
         include: [
            {
               model: Account,
               as: "accounts",
            },
            {
               model: Skill,
               as: "skills",
               attributes: { exclude: ["createdAt", "updatedAt", "description"] },
            },
            {
               model: Certificate,
               as: "certificates"
            }, {
               model: Language,
               as: "language"
            }
         ],
         where: { accountId: req.params.accountId },
      });
      res.status(200).send(freelancer);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

// update freelanacer account
const updateFreelancerAccount = async (req, res) => {
   try {
      let freelancer = await Freelancer.update(req.body, {
         where: { accountId: req.params.accountId },
      });
      let account = await Account.update(req.body.account, {
         where: { id: req.params.accountId }
      })
      res.status(200).send("Cập nhật thành công!");
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

// update introduction
const updateIntroduction = async (req, res) => {
   try {
      const freelancer = await Freelancer.findOne({
         where: { id: req.params.freelancerId }
      });

      freelancer.setDataValue("title", req.body.title);
      freelancer.setDataValue("introduction", req.body.introduction);
      freelancer.save();

      res.status(200).send("Cập nhật thành công!");
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

// update major
const updateMajor = async (req, res) => {
   try {
      const freelancer = await Freelancer.findOne({
         where: { id: req.params.freelancerId }
      });

      freelancer.setDataValue("major", req.body.major);
      freelancer.save();

      res.status(200).send("Cập nhật thành công!");
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

// update hours per week
const updateHoursPerWeek = async (req, res) => {
   try {
      const freelancer = await Freelancer.findOne({
         where: { id: req.params.freelancerId }
      });

      freelancer.setDataValue("hoursPerWeek", req.body.hoursPerWeek);
      freelancer.save();

      res.status(200).send("Cập nhật thành công!");
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

// update hours per week
const updateBasicInfo = async (req, res) => {
   try {
      const freelancer = await Freelancer.findOne({
         where: { id: req.params.freelancerId }
      });

      const account = await Account.findOne({
         where: { id: freelancer.accountId }
      });

      account.setDataValue("phone", req.body.phone);
      account.setDataValue("address", req.body.address);
      account.save();

      res.status(200).send("Cập nhật thành công!");
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

// update image & name
const updateNameAndImage = async (req, res) => {
   try {
      const freelancer = await Freelancer.findOne({
         where: { id: req.params.freelancerId }
      });

      const account = await Account.findOne({
         where: { id: freelancer.accountId }
      });

      account.setDataValue("name", req.body.name);
      account.setDataValue("image", req.body.image);
      account.save();

      res.status(200).send("Cập nhật thành công!");
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

// update CVFile
const updateCVFile = async (req, res) => {
   try {
      const freelancer = await Freelancer.findOne({
         where: { id: req.params.freelancerId }
      });

      freelancer.setDataValue("cvFile", req.body.cvFile);
      freelancer.save();

      res.status(200).send("Cập nhật thành công!");
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
}

// update skill set
const updateSkillSet = async (req, res) => {
   try {
      let skills = req.body.skill;

      const freelancer = await Freelancer.findOne({
         include: [
            {
               model: Skill,
               as: "skills",
               attributes: ["id", "name"],
               through: { attributes: ["freelancerSkillId", "level"] },
            }
         ],
         where: { id: req.params.freelancerId },
      });

      let freelancerSkills = [];

      freelancer.skills.forEach(async freelancerSkill => {
         freelancerSkills.push(freelancerSkill.name)
      });

      // difference between old skill and new skill
      let difference = freelancerSkills.filter(x => !skills.includes(x));
      difference.forEach(async item => {
         const skill = await Skill.findOne({
            where: {
               name: {
                  [db.Op.like]: `%${item}`,
               }
            }
         });
         skill.removeFreelancers(freelancer);
      })

      // difference between new skill and old skill
      difference = skills.filter(x => !freelancerSkills.includes(x));
      difference.forEach(async item => {
         let skill = await Skill.findOne({
            where: {
               name: {
                  [db.Op.like]: `%${item}`,
               }
            }
         });

         if (!skill) {
            skill = await Skill.create({ name: item });
         }

         skill.addFreelancers(freelancer);
      })

      res.status(200).send("Cập nhật thành công!")
      RecommendPointController.updateRecommendationWhenFreelancerUpdate(freelancer.id);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

// update single skill
const updateSkillLevel = async (req, res) => {
   try {
      await FreelancerSkill.update({ level: req.body.level }, {
         where: {
            freelancerSkillId: req.params.freelancerSkillId,
         }
      });

      res.status(200).send("Cập nhật thành công!")

   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

// get Freelancer's languages
const getLanguagesByFreelancer = async (req, res) => {
   try {
      const languages = await Language.findAll({
         attributes: { exclude: ["createdAt", "updatedAt"] },
         where: { freelancerId: req.params.freelancerId }
      });

      res.status(200).send(languages);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

// add languages to freelancer
const addLanguages = async (req, res) => {
   try {
      let checkLanguage = await Language.findOne({
         where: {
            name: req.body.name,
            freelancerId: req.params.freelancerId
         }
      })

      if (!checkLanguage) {
         const info = {
            name: req.body.name,
            level: req.body.level,
            freelancerId: req.params.freelancerId,
         }

         const language = await Language.create(info);
         res.status(200).send("Thêm thành công!");
      } else {
         res.status(400).send('Ngoại ngữ này bạn đã có!');
      }
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

// edit languages
const updateLanguages = async (req, res) => {
   try {
      let languages = req.body.languages;

      languages.forEach(async language => {
         await Language.update(language, {
            where: { id: language.id }
         })
      });

      res.status(200).send("Cập nhật thành công!")
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

// delete language
const deleteLanguages = async (req, res) => {
   try {
      await Language.destroy({
         where: { id: req.params.languageId }
      })

      res.status(200).send("Xóa thành công!")
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

module.exports = {
   getAllFreelancer,
   getFreelancerById,
   updateFreelancerAccount,
   updateIntroduction,
   getLanguagesByFreelancer,
   addLanguages,
   updateBasicInfo,
   updateHoursPerWeek,
   updateMajor,
   updateLanguages,
   deleteLanguages,
   updateSkillSet,
   updateNameAndImage,
   updateCVFile,
   updateSkillLevel,
};
