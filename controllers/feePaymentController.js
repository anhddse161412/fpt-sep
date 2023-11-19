const { Model } = require("sequelize");
const db = require("../models");
const FeePaymentDeadline = db.feePaymentDeadlines;
const Client = db.clients;
const Account = db.accounts;
const { sendEmail } = require("../util/sendEmail");

const createFeePaymentDeadline = async (name, clientId, applicationId) => {
   try {
      const deadLineDays = 10; // 10 days before banning
      const currentDate = new Date().getTime();
      var paymentDeadline = new Date(currentDate);
      paymentDeadline.setDate(paymentDeadline.getDate() + deadLineDays);
      info = {
         name: name,
         paymentDeadline: paymentDeadline,
         status: "not paid",
         clientId: clientId,
         applicationId: applicationId,
      };

      let client = Client.findOne({
         include: [{ model: Account, as: "accounts" }],
         where: { id: clientId },
      });
      if (client) {
         console.log(`Client ${clientId} đã có deadline cho việc thanh toán`);
      }
      await FeePaymentDeadline.create(info);
      console.log(`Đã tạo deadline cho việc thanh toán của client ${clientId}`);
   } catch (error) {
      console.log(error);
   }
};

const checkFeePaymentDeadline = async () => {
   try {
      let message = [];
      await FeePaymentDeadline.findAll({
         attributes: ["paymentDeadline", "clientId", "id"],
         where: { status: "not paid" },
      }).then((res) => {
         res.forEach(async (item) => {
            let client = await Client.findOne({
               include: [
                  { model: Account, as: "accounts", where: { status: 1 } },
               ],
               where: { id: item.clientId },
            });
            if (compareDates(item.paymentDeadline) && client) {
               message.push(`account id : ${client.accounts.id} is banned`);
               let account = client.accounts;
               account.setDataValue("status", 0);
               account.save();

               sendEmail(
                  account.email,
                  "[FPT-SEP]: Thông báo vô hiệu hóa tài khoản",
                  `Tài khoản của bạn đã bị vô hiệu quá vì vi phạm chính sách của trang web (Không thanh toán công việc đúng hạn).
                     nếu có bất cứ thắc mắc xin vui lòng liên hệ với quản trị viên.
                      Trân trọng.`
               );
            }
            if (message.length == 0) {
               message.push("no account ban today");
            }
            console.log(message);
            message = [];
         });
      });
   } catch (error) {
      console.log(error);
   }
};

const compareDates = (date) => {
   const currentDate = new Date().getTime();
   let deadline = new Date(date).getTime();
   if (currentDate < deadline) {
      return false;
   }

   return true;
};

module.exports = {
   createFeePaymentDeadline,
   checkFeePaymentDeadline,
};
