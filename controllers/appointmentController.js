const db = require("../models");

// controller
const notificaitonController = require("./notificationController");

// Util
const { sendEmail } = require("../util/sendEmail");

// create main Model
const Account = db.accounts;
const Appointment = db.appointments;
const Freelancer = db.freelancers;
const Client = db.clients;
const Job = db.jobs;
const Application = db.applications;
const Notification = db.notifications;
// main work

// 1. create Appointment
const createAppointment = async (req, res) => {
   try {
      let info = {
         location: req.body.location,
         link: req.body.link,
         time: req.body.time,
         clientId: req.body.clientId,
         applicationId: req.body.applicationId,
         status: req.body.status ? req.body.status : "Sent",
      };

      const client = await Client.findOne({
         where: { id: req.body.clientId },
         include: [
            {
               model: Account,
               as: "accounts",
               attributes: ["name", "image", "id", "email"],
            },
         ],
      });

      const application = await Application.findOne({
         include: [
            {
               model: Job,
               as: "jobs",
            },
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
         ],
         where: { id: req.body.applicationId },
      });

      const appointment = await Appointment.create(info);
      application.setAppointments(appointment);

      // const notification = await notificaitonController.createNotificationInfo(
      //    application.freelancers.accounts.id,
      //    `Có lịch phỏng vấn mới`,
      //    `Bạn có lịch phỏng vấn mới vào thời gian ${info.time}`,
      //    application.jobs.id
      // );

      let email = application.freelancers.accounts.email;
      sendEmail(
         email,
         `[FPT-SEP] LỜI MỜI PHỎNG VẤN TỪ ${client.accounts.name}`,
         `
         Cảm ơn bạn đã quan tâm đến ${application.jobs.title}. Chúng tôi rất ấn tượng bởi nền tảng của bạn và xin mời bạn đến phỏng vấn với lịch trình như sau:
          - Thời gian : ${info.time}
          - Địa điểm : ${req.body.location ? req.body.location : req.body.link}
         Vui lòng có mặt đúng giờ để có thể trao đổi thêm thông tin.
         Cảm ơn và Trân trọng kính chào,
      `
      );

      res.status(200).json({
         messsage: "Tạo Appointment thành công",
      });
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const getAllAppointment = async (req, res) => {
   try {
      let appointment = await Appointment.findAndCountAll({
         include: [
            {
               model: Application,
               as: "applications",
               include: [
                  {
                     model: Freelancer,
                     as: "freelancers",

                     include: [
                        {
                           model: Account,
                           as: "accounts",
                           attributes: ["name", "email", "image"],
                        },
                     ],
                     attributes: ["id"],
                  },
                  {
                     model: Job,
                     as: "jobs",
                     attributes: ["id", "title"],
                  },
               ],
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
         ],
      });
      res.status(200).send(appointment);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const getAppointmentById = async (req, res) => {
   try {
      let appointment = await Appointment.findOne({
         include: [
            {
               model: Application,
               as: "applications",
               include: [
                  {
                     model: Job,
                     as: "jobs",
                     attributes: ["title"],
                  },
                  {
                     model: Freelancer,
                     as: "freelancers",

                     include: [
                        {
                           model: Account,
                           as: "accounts",
                           attributes: ["name", "email"],
                        },
                     ],
                     attributes: ["id"],
                  },
               ],
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
         ],
         where: { appointmentId: req.params.appointmentId },
      });
      res.status(200).send(appointment);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const getAppointmentByClientId = async (req, res) => {
   try {
      let appointment = await Appointment.findAll({
         include: [
            {
               model: Client,
               as: "clients",

               include: [
                  {
                     model: Account,
                     as: "accounts",
                     attributes: ["id", "name", "email"],
                  },
               ],
               attributes: ["id"],
            },
            {
               model: Application,
               as: "applications",
               include: [
                  {
                     model: Job,
                     as: "jobs",
                     attributes: ["title"],
                  },
                  {
                     model: Freelancer,
                     as: "freelancers",

                     include: [
                        {
                           model: Account,
                           as: "accounts",
                           attributes: ["id", "name", "email"],
                        },
                     ],
                     attributes: ["id"],
                  },
               ],
            },
         ],
         where: { clientId: req.params.clientId },
      });
      res.status(200).send(appointment);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const getAppointmentByFreelancerId = async (req, res) => {
   try {
      let appointment = await Appointment.findAll({
         include: [
            {
               model: Application,
               as: "applications",
               include: [
                  {
                     model: Job,
                     as: "jobs",
                     attributes: ["title"],
                  },
                  {
                     model: Freelancer,
                     as: "freelancers",

                     include: [
                        {
                           model: Account,
                           as: "accounts",
                           attributes: ["name", "email"],
                        },
                     ],
                     attributes: ["id"],
                  },
               ],
               where: { freelancerId: req.params.freelancerId },
            },
         ],
      });
      res.status(200).send(appointment);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const getAppointmentByJobId = async (req, res) => {
   try {
      let appointment = await Appointment.findAll({
         include: [
            {
               model: Application,
               as: "applications",
               include: [
                  {
                     model: Job,
                     as: "jobs",
                  },
               ],
               where: { jobId: req.params.jobId },
            },
         ],
      });
      res.status(200).send(appointment);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const updateAppointment = async (req, res) => {
   try {
      let appointment = await Appointment.findOne({
         where: { appointmentId: req.params.appointmentId },
         include: [
            {
               model: Application,
               as: "applications",
               include: [
                  {
                     model: Freelancer,
                     as: "freelancers",

                     include: [
                        {
                           model: Account,
                           as: "accounts",
                           attributes: ["name", "email", "image"],
                        },
                     ],
                     attributes: ["id"],
                  },
                  {
                     model: Job,
                     as: "jobs",
                     attributes: ["id", "title"],
                  },
               ],
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
         ],
      });

      var freelancerEmail = appointment.applications.freelancers.accounts.email;
      var clientName = appointment.clients.accounts.name;
      const newTime = new Date(req.body.time);

      if (appointment.time.getTime() == newTime.getTime()) {
         sendEmail(
            freelancerEmail,
            `[FPT-SEP] THÔNG BÁO THAY ĐỔI LỊCH PHỎNG VẤN TỪ ${clientName}`,
            `
            Thân gửi ứng viên, Chúng tôi rất tiếc khi phải thông báo rằng lịch phỏng vấn của bạn đã bị thay đổi. Đây là do một số sự cố kỹ thuật không mong muốn xảy ra từ phía chúng tôi.
            Chúng tôi rất thành thật xin lỗi vì sự bất tiện và xin mời bạn đến phỏng vấn với lịch trình mới như sau:
             - Thời gian : ${req.body.time}
             - Địa điểm : ${req.body.location ? req.body.location : req.body.link
            }
            Vui lòng xác nhận lại lịch phỏng vấn mới của bạn bằng cách trả lời email này trong vòng 24 giờ. Nếu bạn có bất kỳ thắc mắc hay yêu cầu nào, xin đừng ngần ngại liên hệ với chúng tôi.
            Cảm ơn và Trân trọng kính chào,
         `
         );
         const updatedAppointment = await Appointment.update(req.body, {
            where: { appointmentId: req.params.appointmentId },
         });
         res.status(200).send({ message: "Đã cập nhật lịch phỏng vấn" });
      } else {
         let currentTime = new Date();
         let unchangeableTime = appointment.time;
         unchangeableTime.setDate(unchangeableTime.getDate() - 1);

         if (currentTime.getTime() > unchangeableTime.getTime()) {
            return res.status(406).json({
               message: "Không thể thay đổi thời gian của Appointment!",
            });
         } else {
            sendEmail(
               freelancerEmail,
               `[FPT-SEP] THÔNG BÁO THAY ĐỔI LỊCH PHỎNG VẤN TỪ ${clientName}`,
               `
            Thân gửi ứng viên, Chúng tôi rất tiếc khi phải thông báo rằng lịch phỏng vấn của bạn đã bị thay đổi. Đây là do một số sự cố kỹ thuật không mong muốn xảy ra từ phía chúng tôi.
            Chúng tôi rất thành thật xin lỗi vì sự bất tiện và xin mời bạn đến phỏng vấn với lịch trình mới như sau:
             - Thời gian : ${req.body.time}
             - Địa điểm : ${req.body.location}
            Vui lòng xác nhận lại lịch phỏng vấn mới của bạn bằng cách trả lời email này trong vòng 24 giờ. Nếu bạn có bất kỳ thắc mắc hay yêu cầu nào, xin đừng ngần ngại liên hệ với chúng tôi.
            Cảm ơn và Trân trọng kính chào,
         `
            );
            const updatedAppointment = await Appointment.update(req.body, {
               where: { appointmentId: req.params.appointmentId },
            });
            res.status(200).send({ message: "Đã cập nhật lịch phỏng vấn" });
         }
      }
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

module.exports = {
   createAppointment,
   getAllAppointment,
   getAppointmentById,
   getAppointmentByClientId,
   getAppointmentByFreelancerId,
   getAppointmentByJobId,
   updateAppointment,
};
