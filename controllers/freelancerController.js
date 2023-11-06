const db = require("../models");

// image Upload

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
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
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
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
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
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
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
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
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
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
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
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
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
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
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
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
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
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
}

// update skill set
const updateSkillSet = async (req, res) => {
   try {
      let newSkills = req.body.skill;

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
         freelancerSkills.push(freelancerSkill)
      });

      // update existed skill level
      newSkills.forEach(async newSkill => {
         freelancerSkills.forEach(async freelancerSkill => {
            if (newSkill.name === freelancerSkill.name) {
               newSkills = newSkills.filter(x => x.name != newSkill.name);
               freelancerSkills = freelancerSkills.filter(x => x.name != freelancerSkill.name);
               await freelancerSkill.freelancerskill.update({ level: newSkill.level });
            }
         })
      });

      // create new freelancer's skills and add to db
      newSkills.forEach(async newSkill => {
         let skill = await Skill.findOne({ where: { name: newSkill.name } });
         if (!skill) {
            skill = await Skill.create({
               name: newSkill.name.charAt(0).toUpperCase() + newSkill.name.slice(1),
            });
            let data = {
               freelancerId: req.params.freelancerId,
               skillId: skill.id,
               level: newSkill.level,
            }
            await FreelancerSkill.create(data);
         } else {
            let data = {
               freelancerId: req.params.freelancerId,
               skillId: skill.id,
               level: newSkill.level,
            }
            await FreelancerSkill.create(data);
         }
      })

      // remove old freelancer's skill
      freelancerSkills.forEach(async freelancerSkill => {
         const skill = await Skill.findOne({
            where: {
               name: {
                  [db.Op.like]: `%${freelancerSkill.name}`,
               }
            }
         });
         skill.removeFreelancers(freelancer);
      })

      res.status(200).send("Cập nhật thành công!")
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
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
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
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
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
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
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
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
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
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
};
