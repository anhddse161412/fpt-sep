const { Sequelize } = require("sequelize");
const db = require("../models");

// controller
const notificaitonController = require("./notificationController");
const paymentController = require("./paymentController");
const feePaymentController = require("./feePaymentController");

// Sequelize operation
const Op = Sequelize.Op;

// util
const { sendEmail } = require("../util/sendEmail");

// create main Model
const Account = db.accounts;
const Application = db.applications;
const Freelancer = db.freelancers;
const Job = db.jobs;
const Client = db.clients;
const RecommendPoint = db.recommendPoints;
// main work

// 1. create application
const createApplication = async (req, res) => {
   try {
      let info = {
         fileAttach: req.body.fileAttach,
         description: req.body.description,
         sendDate: req.body.sendDate,
         freelancerId: req.body.freelancerId,
         jobId: req.body.jobId,
         status: req.body.status ? req.body.status : "Sent",
      };
      const job = await Job.findOne({
         where: { id: req.body.jobId },
      });

      const application = await Application.create(info);
      let applicationCounter = await job.countApplications();
      job.setDataValue("applied", applicationCounter.toString());
      job.save();

      res.status(200).json({ messsage: "Tạo application thành công" });
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};
// 2. get all application
const getAllApplication = async (req, res) => {
   try {
      let propsals = await Application.findAndCountAll({
         include: [
            {
               model: Freelancer,
               as: "freelancers",

               include: [
                  {
                     model: Account,
                     as: "accounts",
                     attributes: ["name", "image"],
                  },
               ],
               attributes: ["id"],
            },
         ],
      });
      res.status(200).send(propsals);
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

const getApplicationById = async (req, res) => {
   try {
      let application = await Application.findOne({
         include: [
            {
               model: Freelancer,
               as: "freelancers",

               include: [
                  {
                     model: Account,
                     as: "accounts",
                     attributes: ["name", "image"],
                  },
               ],
               attributes: ["id"],
            },
         ],
         where: { id: req.params.applicationId },
      });
      res.status(200).send(application);
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

const updateApplication = async (req, res) => {
   try {
      let application = await Application.update(req.body, {
         include: [
            {
               model: Freelancer,
               as: "freelancers",
               include: [
                  {
                     model: Account,
                     as: "accounts",
                     attributes: ["name", "image"],
                  },
               ],
               attributes: ["id"],
            },
         ],
         where: { id: req.params.applicationId },
      });
      res.status(200).send(application);
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

const getApplicationByJobId = async (req, res) => {
   try {
      let application = await Application.findAll({
         include: [
            {
               model: Freelancer,
               as: "freelancers",

               include: [
                  {
                     model: Account,
                     as: "accounts",
                     attributes: ["name", "image"],
                  },
               ],
               attributes: ["id"],
            },
         ],
         where: { jobId: req.params.jobId },
      });
      res.status(200).send(application);
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

const getRecommendApplicationByJobId = async (req, res) => {
   try {
      let recommended = await RecommendPoint.findAll({
         include: [
            {
               model: Freelancer,
               as: "freelancers",
               attributes: ["id"],
               include: [
                  {
                     model: Account,
                     as: "accounts",
                     attributes: ["name", "email", "image"],
                  },
                  {
                     model: Application,
                     as: "applications",
                     attributes: { exclude: ["createdAt", "updatedAt"] },
                     where: { jobId: req.params.jobId },
                  },
               ],
            },
         ],
         attributes: ["point"],
         where: {
            jobId: req.params.jobId,
            type: "forApplications",
            point: { [Op.gt]: 0 },
         },
         order: [["point", "DESC"]],
      });

      res.status(200).send(recommended);
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

// Get Application by freelancer ID
const getApplicationByFreelancerId = async (req, res) => {
   try {
      let application = await Application.findAll({
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
                           attributes: ["name"],
                        },
                     ],
                     attributes: ["id"],
                  },
               ],
               attributes: ["id", "title"],
            },
         ],
         where: { freelancerId: req.params.freelancerId },
         order: [["sendDate", "DESC"]],
      });
      res.status(200).send(application);
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

// Get Application by Client ID
const getApplicationByClientId = async (req, res) => {
   try {
      let jobs = await Job.findAll({
         attributes: ["id"],
         where: { clientId: req.params.clientId, applied: { [Op.not]: null } },
      });

      let jobsId = [];

      jobs.forEach((job) => {
         jobsId.push(job.id);
      });

      let applications = await Application.findAll({
         include: [
            {
               model: Job,
               as: "jobs",
               attributes: ["id", "title"],
            },
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
         where: { jobId: { [Op.in]: jobsId } },
         order: [["sendDate", "DESC"]],
      });
      res.status(200).send(applications);
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

// approve application
const approveApplication = async (req, res) => {
   try {
      let approveFee = 10000;
      let application = await Application.findOne({
         include: [
            {
               model: Freelancer,
               as: "freelancers",

               include: [
                  {
                     model: Account,
                     as: "accounts",
                     attributes: ["name", "image", "id", "email"],
                  },
               ],
               attributes: ["id"],
            },
            {
               model: Job,
               as: "jobs",
               attributes: ["id", "title"],
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
            },
         ],
         where: { id: req.params.applicationId },
      });
      application.setDataValue("status", "approved");
      application.save();
      // const notification = await notificaitonController.createNotificationInfo(
      //    application.freelancers.accounts.id,
      //    `Application status has changed`,
      //    `Your application has been approved, ${application.freelancers.accounts.name}`
      // );
      if (parseInt(application.jobs.clients.currency) >= approveFee) {
         const client = await Client.findOne({
            where: { id: application.jobs.clients.id },
            include: [
               {
                  model: Account,
                  as: "accounts",
               },
            ],
         });

         sendEmail(
            application.freelancers.accounts.email,
            `[FPT-SEP] THÔNG BÁO PHỎNG VẤN TỪ ${client.accounts.name}`,
            `
         Cảm ơn bạn đã dành thời gian tham dự buổi phỏng vấn. Chúng tôi xin thông báo rằng Bạn đã vượt qua thành công cuộc phỏng vấn của chúng tôi 
         Chúng tôi sẽ liên hệ với bạn sau. Hãy kiểm tra email thường xuyên để không bỏ lỡ bất kỳ thông tin nào từ chúng tôi.
         Chúng tôi rất mong được hợp tác với bạn `
         );

         let newCurrencyValue = client.currency - approveFee;
         client.setDataValue("currency", newCurrencyValue);
         client.save();

         sendEmail(
            application.jobs.clients.accounts.email,
            `[FPT-SEP] Công việc bạn đăng đã được thanh toán tự động thành công`,
            `
         Công việc "${application.jobs.title}" đã được thanh toán tự động thành công. Vui lòng kiểu tra số dư toàn khoản trên website. 
         Trân trọng.
      `
         );

         let info = {
            amount: approveFee,
            name: "Thanh toán tự động",
            description: `Thanh toán tự động cho công việc "${application.jobs.title}"`,
            status: true,
            type: "-",
            clientId: `${application.jobs.clients.id}`,
         };
         paymentController.createAutoCollectFeePayment(info);
      } else {
         feePaymentController.createFeePaymentDeadline(
            `Hạn thanh toán của client ${application.jobs.clients.accounts.name}`,
            application.jobs.clients.id
         );
         sendEmail(
            application.jobs.clients.accounts.email,
            `[FPT-SEP] Công việc bạn đăng đã không được thanh toán tự động thành công`,
            `
         Công việc "${application.jobs.title}" đã không được thanh toán tự động thành công do không đủ số dư trong tài khoản.
         Vui lòng nạp thêm để có thể thanh toán.
         Lưu ý : Sau 10 ngày. Nếu công việc vẫn chưa được thanh toán, tài khoản của quý khách sẽ bị vô hiệu hóa.
         Trân trọng.
      `
         );
      }

      res.status(200).send(application);
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

// change application to interview
const interviewApplication = async (req, res) => {
   try {
      let application = await Application.findOne({
         include: [
            {
               model: Freelancer,
               as: "freelancers",
               include: [
                  {
                     model: Account,
                     as: "accounts",
                     attributes: ["name", "image", "id", "email"],
                  },
               ],
               attributes: ["id"],
            },
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
                           attributes: ["name", "image", "id", "email"],
                        },
                     ],
                     attributes: ["id"],
                  },
               ],
            },
         ],
         where: { id: req.params.applicationId },
      });
      application.setDataValue("status", "interview");
      application.save();
      // const notification = await notificaitonController.createNotificationInfo(
      //    application.freelancers.accounts.id,
      //    `Application status has changed`,
      //    `You have a interview invitation ,${application.freelancers.accounts.name}`
      // );

      res.status(200).send(application);
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

// decline propsal
const declineApplication = async (req, res) => {
   try {
      let application = await Application.findOne({
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
         where: { id: req.params.applicationId },
      });
      application.setDataValue("status", "declined");
      application.save();
      // const notification = await notificaitonController.createNotificationInfo(
      //    application.freelancers.accounts.id,
      //    `Application status has changed`,
      //    `Your application has been declined ,${application.freelancers.accounts.name}`
      // );
      res.status(200).send(application);
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

module.exports = {
   createApplication,
   getAllApplication,
   getApplicationById,
   updateApplication,
   approveApplication,
   declineApplication,
   getApplicationByJobId,
   getApplicationByFreelancerId,
   getApplicationByClientId,
   getRecommendApplicationByJobId,
   interviewApplication,
};
