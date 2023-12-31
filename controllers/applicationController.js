const { Sequelize } = require("sequelize");
const db = require("../models");

// controller
const notificaitonController = require("./notificationController");
const paymentController = require("./paymentController");
const feePaymentController = require("./feePaymentController");
const RecommendPointController = require("./recommendPointController");

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
const SystemValue = db.systemValues;
const Appointment = db.appointments;
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
         status: req.body.status ? req.body.status : "sent",
      };
      const job = await Job.findOne({
         where: { id: req.body.jobId, status: "open" },
      });

      if (job) {
         await Application.create(info);
         let applicationCounter = await job.countApplications();
         job.setDataValue("applied", applicationCounter.toString());
         job.save();

         res.status(200).json({ message: "Gửi đơn ứng tuyển thành công" });
         RecommendPointController.rateApplicationAfterCreate(req.body.freelancerId, job.id);
      } else {
         res.status(400).json({ message: "Công việc này đã đóng!" });
      }
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
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
                     attributes: ["name", "image", "id"],
                  },
               ],
               attributes: ["id"],
            },
            {
               model: Job,
               as: "jobs"
            }
         ],
      });
      res.status(200).send(propsals);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
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
                     attributes: ["id", "name", "image"],
                  },
               ],
               attributes: ["id"],
            },
         ],
         where: { id: req.params.applicationId },
      });
      res.status(200).send(application);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
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
                     attributes: ["id", "name", "image"],
                  },
               ],
               attributes: ["id"],
            },
         ],
         where: { id: req.params.applicationId },
      });
      res.status(200).send(application);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const getApplicationByJobId = async (req, res) => {
   try {
      let freelancerList = [];

      const job = await Job.findOne({
         where: { id: req.params.jobId },
      });

      await Application.findAll({
         include: [
            {
               model: Job,
               as: "jobs",
               include: [
                  {
                     model: Client,
                     as: "clients",
                  },
               ],
               where: { clientId: job.clientId },
            },
            {
               model: Freelancer,
               as: "freelancers",
            },
         ],
         where: {
            status: "approved",
         },
      }).then((res) => {
         res.forEach(async (item) => {
            freelancerList.push(item.freelancers.id);
         });
      });
      let freelancerSetList = new Set(freelancerList);
      let resultList = [];

      await RecommendPoint.findAll({
         include: [
            {
               model: Freelancer,
               as: "freelancers",
               attributes: ["id"],
               include: [
                  {
                     model: Account,
                     as: "accounts",
                     attributes: ["name", "email", "image", "id"],
                  },
                  {
                     model: Application,
                     as: "applications",
                     attributes: { exclude: ["createdAt", "updatedAt"] },
                     where: { jobId: req.params.jobId },
                     include: [
                        {
                           model: Appointment,
                           as: "appointments",
                        },
                     ],
                  },
               ],
            },
         ],
         attributes: ["point"],
         where: {
            jobId: req.params.jobId,
            type: "forApplications",
         },
         order: [["point", "DESC"]],
      }).then((res) => {
         res.forEach(async (item) => {
            if ([...freelancerSetList].includes(item.freelancers.id)) {
               item.setDataValue("hired", true);
            }
            resultList.push(item);
         });
      });

      res.status(200).send(resultList);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
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
                     attributes: ["id", "name", "email", "image"],
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
         },
         order: [["point", "DESC"]],
      });

      res.status(200).send(recommended);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
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
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

// Get Application by Client ID
const getApplicationByClientId = async (req, res) => {
   try {
      let freelancerList = [];

      await Application.findAll({
         include: [
            {
               model: Job,
               as: "jobs",
               include: [
                  {
                     model: Client,
                     as: "clients",
                  },
               ],
               where: { clientId: req.params.clientId },
            },
            {
               model: Freelancer,
               as: "freelancers",
            },
         ],
         where: {
            status: "approved",
         },
      }).then((res) => {
         res.forEach(async (item) => {
            freelancerList.push(item.freelancers.id);
         });
      });
      let freelancerSetList = new Set(freelancerList);
      let resultList = [];

      await Application.findAll({
         include: [
            {
               model: Job,
               as: "jobs",
               attributes: ["id", "title"],
               where: {
                  clientId: req.params.clientId,
                  applied: { [Op.not]: null },
               },
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
            {
               model: Appointment,
               as: "appointments",
            },
         ],
         // where: { jobId: { [Op.in]: jobsId } },
         order: [["sendDate", "DESC"]],
      }).then((res) => {
         res.forEach(async (item) => {
            if ([...freelancerSetList].includes(item.freelancers.id)) {
               item.freelancers.setDataValue("hired", true);
            }
            resultList.push(item);
         });
      });
      res.status(200).send(resultList);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

// approve application
const approveApplication = async (req, res) => {
   try {
      let message = "Lỗi server";
      let systemValue = await SystemValue.findOne({
         where: { name: "commissionFee" },
      });
      let approveFee = systemValue.value;
      console.log(approveFee);
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
            description: `Thanh toán tự động cho việc nhận ứng viên của công việc: "${application.jobs.title}"`,
            status: true,
            type: "-",
            clientId: `${application.jobs.clients.id}`,
         };
         await paymentController.createAutoCollectFeePayment(info);
         message =
            "Đã thanh toán tự động cho việc nhận ứng viên" +
            `"${application.jobs.title}": -${approveFee}VNĐ` +
            ". Vui lòng kiểu tra số dư toàn khoản trên website. ";
      } else {
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

         await feePaymentController.createFeePaymentDeadline(
            `Hạn thanh toán của client ${application.jobs.clients.accounts.name}`,
            application.jobs.clients.id,
            application.id
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
         message =
            "Công việc " +
            `"${application.jobs.title}"` +
            " đã không được thanh toán tự động thành công do không đủ số dư trong tài khoản.Vui lòng nạp thêm để có thể thanh toán. ";
      }

      res.status(200).send({ message });
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
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
      console.error(error);
      res.status(400).json({ message: error.toString() });
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
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

// close all application when job close
const declineCloseJobApplication = async (req, res) => {
   const jobs = await Job.findAll({
      attributes: ["id"],
      where: {
         status: {
            [Op.ne]: "open"
         },
      }
   });

   const applications = await Application.findAll({
      where: {
         jobId: {
            [Op.in]: jobs.map((job) => job.dataValues.id),
         },
         status: {
            [Op.ne]: "approve"
         },
      },
   })

   applications.forEach(application => {
      application.setDataValue('status', 'declined');
      application.save();
   })
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
   declineCloseJobApplication
};
