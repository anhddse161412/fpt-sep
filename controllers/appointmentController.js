const db = require("../models");

// image Upload

// create main Model
const Account = db.accounts;
const Appointment = db.appointments;
const Freelancer = db.freelancers;
const Client = db.clients;
const Job = db.jobs;
const Proposal = db.proposals;
// main work

// 1. create Appointment
const createAppointment = async (req, res) => {
   try {
      let info = {
         location: req.body.location,
         link: req.body.link,
         time: req.body.time,
         clientId: req.body.clientId,
         proposalId: req.body.proposalId,
         status: req.body.status ? req.body.status : "Sent",
      };

      const client = await Client.findOne({
         where: { id: req.body.clientId },
      });
      const proposal = await Proposal.findOne({
         where: { id: req.body.proposalId },
      });

      const appointment = await Appointment.create(info);
      proposal.setAppointments(appointment);
      res.status(200).json({ messsage: "Tạo Appointment thành công" });
   } catch (error) {
      console.log(error);
   }
};

const getAllAppointment = async (req, res) => {
   try {
      let appointment = await Appointment.findAndCountAll({
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
               model: Job,
               as: "jobs",
            },
         ],
      });
      res.status(200).send(appointment);
   } catch (error) {
      console.log(error);
   }
};

const getAppointmentById = async (req, res) => {
   try {
      let appointment = await Appointment.findOne({
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
               model: Job,
               as: "jobs",
            },
         ],
         where: { appointmentId: req.params.appointmentId }
      });
      res.status(200).send(appointment);
   } catch (error) {
      console.log(error);
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
                     attributes: ["name", "email"],
                  },
               ],
               attributes: ["id"],
            },
         ],
         where: { clientId: req.params.clientId },
      });
      res.status(200).send(appointment);
   } catch (error) {
      console.log(error);
   }
};

const getAppointmentByFreelancerId = async (req, res) => {
   try {
      let appointment = await Appointment.findAll({
         include: [
            {
               model: Proposal,
               as: "proposals",
               include: [
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
            }
         ],
      });
      res.status(200).send(appointment);
   } catch (error) {
      console.log(error);
   }
};

const getAppointmentByJobId = async (req, res) => {
   try {
      let appointment = await Appointment.findAll({
         include: [
            {
               model: Proposal,
               as: "proposals",
               include: [
                  {
                     model: Job,
                     as: "jobs",
                  },
               ],
               where: { jobId: req.params.jobId },
            }
         ],
      });
      res.status(200).send(appointment);
   } catch (error) {
      console.log(error);
   }
};

const updateAppointment = async (req, res) => {
   try {
      let appointment = await Appointment.update(req.body, {
         where: { appointmentId: req.params.appointmentId },
      });
      res.status(200).send(appointment);
   } catch (error) {
      console.log(error);
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
