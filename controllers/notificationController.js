const db = require("../models");

const Notification = db.notifications;
const Account = db.accounts;

const createNotification = async (req, res) => {
   try {
      let info = {
         name: req.body.name,
         description: req.body.description,
         status: "unread",
      };
      let accountId = req.body.accountId;

      const notification = await Notification.create(info);
      const account = await Account.findOne({
         where: { id: accountId },
      });

      if (account) {
         account.addNotification(notification);
      }
      res.status(200).send({
         message: "Tao thong bao thanh cong",
      });
   } catch (error) {
      console.log(error);
   }
};

const getAllNotification = async (req, res) => {
   try {
      const notifications = await Notification.findAll();
      res.status(200).send(notifications);
   } catch (error) {
      console.log(error);
   }
};

const getNotificationByAccountId = async (req, res) => {
   try {
      const notifications = await Notification.findAll({
         where: { accountId: req.params.accountId },
      });
      res.status(200).send(notifications);
   } catch (error) {
      console.log(error);
   }
};

const deleteNotification = async (req, res) => {
   try {
      const notification = await Notification.destroy({
         where: { id: req.params.id },
      });
      res.status(200).send({ message: "deleted" });
   } catch (error) {
      console.log(error);
   }
};

const markAsReadNotification = async (req, res) => {
   try {
      const notification = await Notification.findOne({
         where: { id: req.params.id },
      });
      notification.setDataValue("status", "read");
      notification.save();
      res.status(200).send({
         message: "",
      });
   } catch (error) {
      console.log(error);
   }
};

module.exports = {
   createNotification,
   getAllNotification,
   getNotificationByAccountId,
   deleteNotification,
   markAsReadNotification,
};
