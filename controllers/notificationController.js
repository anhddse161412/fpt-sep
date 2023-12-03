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
         notification: notification,
         message: "Tao thong bao thanh cong",
      });
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const createNotificationInfo = async (
   accountId,
   notificationName,
   notificationDescription
) => {
   try {
      let info = {
         name: notificationName,
         description: notificationDescription,
         status: "unread",
      };

      const notification = await Notification.create(info);
      const account = await Account.findOne({
         where: { id: accountId },
      });

      if (account) {
         account.addNotification(notification);
      }
      console.log(
         `Tao thanh cong thong bao ${notificationName} cho User ${accountId}`
      );
      console.log(notification.dataValues);
      return notification.dataValues;
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const getAllNotification = async (req, res) => {
   try {
      const notifications = await Notification.findAll({
         order: [["updatedAt", "DESC"]],
      });
      res.status(200).send(notifications);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const getNotificationById = async (req, res) => {
   try {
      const notification = await Notification.findOne({
         where: { id: req.params.id },
      });
      res.status(200).send(notification);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const getAllNotificationByAccountId = async (req, res) => {
   try {
      const { count, rows: unreadNotifications } =
         await Notification.findAndCountAll({
            where: { accountId: req.params.accountId, status: "unread" },
            order: [["updatedAt", "DESC"]],
         });

      const { rows: notifications } = await Notification.findAndCountAll({
         where: { accountId: req.params.accountId },
         order: [["updatedAt", "DESC"]],
      });
      res.status(200).send({
         unreadNotifications: count,
         notifications: notifications,
      });
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const markAsReadNotification = async (req, res) => {
   try {
      const notification = await Notification.findOne({
         where: { id: req.params.id },
      });
      notification.setDataValue("status", "read");
      notification.save();
      res.status(200).send({ message: "Đã đánh dấu đọc thông báo này" });
   } catch (error) {
      console.log(error);
      res.status(400).json({ message: error.toString() });
   }
};

const markAsReadAllNotification = async (req, res) => {
   try {
      await Notification.findAll({
         where: { accountId: req.params.accountId },
      }).then((res) => {
         res.forEach(async (item) => {
            item.setDataValue("status", "read");
            item.save();
         });
      });

      res.status(200).send({ message: "Đã đánh dấu đọc tất cả" });
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

module.exports = {
   createNotification,
   getAllNotification,
   getAllNotificationByAccountId,
   markAsReadNotification,
   markAsReadAllNotification,
   createNotificationInfo,
   getNotificationById,
};
