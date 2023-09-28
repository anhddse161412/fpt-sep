const db = require("../models");
// image Upload

// create main Model
const Certificate = db.certificates;
const Freelancer = db.freelancers;

// main work

// 1. create Category

const createCertificate = async (req, res) => {
   try {
      let info = {
         name: req.body.name,
         issuingOrganization: req.body.issuingOrganization,
         issueDate: req.body.issueDate,
         expirationDate: req.body.expirationDate,
         credentialId: req.body.credentialId,
         credentialUrl: req.body.credentialUrl,
         status: req.body.status ? req.body.status : true,
      };
      const freelancer = await Freelancer.findOne({
         where: { accountId: req.body.accountId },
      });

      const certificate = await Certificate.create(info);
      freelancer.setCertificates(certificate);
      res.status(200).send(certificate);
   } catch (error) {
      console.log(error);
   }
};

// 2. get all Category
const getAllCertificate = async (req, res) => {
   try {
      let certificate = await Certificate.findAll({
         include: [
            {
               model: Freelancer,
               as: "freelancers",
            },
         ],
      });
      res.status(200).send(certificate);
   } catch (error) {
      console.log(error);
   }
};

const getCertificateById = async (req, res) => {
   try {
      let certificate = await Certificate.findOne({
         where: { id: req.params.certificateId },
      });
      res.status(200).send(certificate);
   } catch (error) {
      console.log(error);
   }
};

const updateCertificate = async (req, res) => {
   try {
      let certificate = await Certificate.update(req.body, {
         where: { id: req.params.certificateId },
      });
      res.status(200).json({ messsage: "Update certificate thành công" });
   } catch (error) {
      console.log(error);
   }
};

// 7. connect one to many relation

const getCertificateByFreelancerId = async (req, res) => {
   const data = await Certificate.findAll({
      include: [
         {
            model: Freelancer,
            as: "freelancers",
         },
      ],
      where: { freelancerId: req.params.freelancerId },
   });

   res.status(200).send(data);
};

module.exports = {
   createCertificate,
   getAllCertificate,
   getCertificateById,
   getCertificateByFreelancerId,
   updateCertificate,
};
