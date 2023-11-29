const db = require("../models");
const config = require("../config/vnpayConfig");

const moment = require("moment");
const axios = require("axios");
const request = require("request");

const Payment = db.payments;
const Client = db.clients;
const FeePaymentDeadline = db.feePaymentDeadlines;
const Application = db.applications;
const Job = db.jobs;
const SystemValue = db.systemValues;
const Account = db.accounts;

const getAllPayment = async (req, res) => {
   try {
      let payments = await Payment.findAll({
         include: [
            {
               model: Client,
               as: "clients",
               attributes: ["id"],
               include: [
                  {
                     model: Account,
                     as: "accounts",
                     attributes: ["id", "name", "email"],
                  },
               ],
            },
         ],
         order: [["createdAt", "DESC"]],
      });
      res.status(200).send(payments);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const getRevenue = async (req, res) => {
   try {
      let totalRevenue = 0;
      let { count, rows: payments } = await Payment.findAndCountAll({
         include: [
            {
               model: Client,
               as: "clients",
               attributes: ["id"],
               include: [
                  {
                     model: Account,
                     as: "accounts",
                     attributes: ["id", "name", "email"],
                  },
               ],
            },
         ],
         where: { type: "-" },
         order: [["createdAt", "DESC"]],
      });

      payments.forEach((item) => {
         item.setDataValue("type", "+");
         totalRevenue = totalRevenue + item.amount;
      });

      res.status(200).json({
         payments,
         total: count,
         revenue: totalRevenue,
      });
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const getDeposit = async (req, res) => {
   try {
      let totalDeposit = 0;
      let { count, rows: payments } = await Payment.findAndCountAll({
         include: [
            {
               model: Client,
               as: "clients",
               attributes: ["id"],
               include: [
                  {
                     model: Account,
                     as: "accounts",
                     attributes: ["id", "name", "email"],
                  },
               ],
            },
         ],
         where: { type: "+" },
         order: [["createdAt", "DESC"]],
      });

      payments.forEach((item) => {
         totalDeposit = totalDeposit + item.amount;
      });

      res.status(200).json({
         payments,
         total: count,
         deposit: totalDeposit,
      });
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const getPaymentByClientId = async (req, res) => {
   try {
      let payments = await Payment.findAll({
         where: {
            clientId: req.params.clientId,
         },
         order: [["createdAt", "DESC"]],
      });
      let client = await Client.findOne({
         where: { id: req.params.clientId },
      });
      res.status(200).send({
         payment: payments,
         clientCurrency: client.currency,
      });
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const createPayment = async (req, res) => {
   try {
      let systemValue = await SystemValue.findOne({
         where: { name: "commissionFee" },
      });
      let approveFee = systemValue.value;
      let info = {
         amount: req.body.amount,
         name: req.body.name,
         description: req.body.description,
         orderId: req.body.orderId,
         transDate: req.body.transDate,
         transType: req.body.transType,
         status: true,
         type: req.body.type,
      };
      let clientId = req.body.clientId;

      const payment = await Payment.create(info);
      const client = await Client.findOne({
         where: { id: clientId },
      });
      // update client's currency
      if (info.type === "+") {
         let newCurrencyValue = client.currency + parseInt(info.amount);
         client.setDataValue("currency", newCurrencyValue);
         client.save();
      } else if (info.type === "-") {
         let newCurrencyValue = client.currency - parseInt(info.amount);
         client.setDataValue("currency", newCurrencyValue);
         client.save();
      }

      //
      client.addPayment(payment);
      await FeePaymentDeadline.findAll({
         include: [
            {
               model: Client,
               as: "clients",
            },
            {
               model: Application,
               as: "applications",
               include: [
                  {
                     model: Job,
                     as: "jobs",
                  },
               ],
            },
         ],
         where: { clientId: clientId, status: "not paid" },
      }).then((res) => {
         res.forEach(async (item) => {
            console.log(item.id);
            if (item && client.currency >= approveFee) {
               let newCurrencyValue = client.currency - parseInt(approveFee);
               client.setDataValue("currency", newCurrencyValue);
               client.save();
               item.setDataValue("status", "paid");
               item.save();

               // create new payment
               let info = {
                  amount: approveFee,
                  name: "Thanh toán tự động",
                  description: `Thanh toán tự động cho công việc "${item.applications.jobs.title}"`,
                  status: true,
                  type: "-",
                  clientId: `${item.clients.id}`,
               };

               await createAutoCollectFeePayment(info);
            }
         });
      });
      res.status(200).send({ message: "Luu giao dich thanh cong" });
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const createAutoCollectFeePayment = async (info) => {
   try {
      const payment = await Payment.create(info);
      const client = await Client.findOne({
         where: { id: info.clientId },
      });
      client.addPayment(payment);
      console.log("Lưu giao dịch thành công");
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const createVnpayUrl = async (req, res) => {
   try {
      process.env.TZ = "Asia/Ho_Chi_Minh";

      let date = new Date();
      let createDate = moment(date).format("YYYYMMDDHHmmss");

      let ipAddr =
         req.headers["x-forwarded-for"] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         req.connection.socket.remoteAddress;

      let tmnCode = config.vnp_TmnCode;
      let secretKey = config.vnp_HashSecret;
      let vnpUrl = config.vnp_Url;
      let returnUrl = config.vnp_ReturnUrl;
      let orderId = moment(date).format("DDHHmmss");
      let amount = req.body.amount;
      let bankCode = req.body.bankCode;

      let locale = req.body.language;
      if (locale === null || locale === "") {
         locale = "vn";
      }
      let currCode = "VND";
      let vnp_Params = {};
      vnp_Params["vnp_Version"] = "2.1.0";
      vnp_Params["vnp_Command"] = "pay";
      vnp_Params["vnp_TmnCode"] = tmnCode;
      vnp_Params["vnp_Locale"] = locale;
      vnp_Params["vnp_CurrCode"] = currCode;
      vnp_Params["vnp_TxnRef"] = orderId;
      vnp_Params["vnp_OrderInfo"] = "Thanh toan cho ma GD:" + orderId;
      vnp_Params["vnp_OrderType"] = "other";
      vnp_Params["vnp_Amount"] = amount * 100;
      vnp_Params["vnp_ReturnUrl"] = returnUrl;
      vnp_Params["vnp_IpAddr"] = ipAddr;
      vnp_Params["vnp_CreateDate"] = createDate;
      if (bankCode !== null && bankCode !== "") {
         vnp_Params["vnp_BankCode"] = bankCode;
      }

      vnp_Params = sortObject(vnp_Params);

      let querystring = require("qs");
      let signData = querystring.stringify(vnp_Params, { encode: false });
      let crypto = require("crypto");
      let hmac = crypto.createHmac("sha512", secretKey);
      let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
      vnp_Params["vnp_SecureHash"] = signed;
      vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });
      req.session.clientId = req.body.clientId;
      res.status(200).send({
         vnpUrl: vnpUrl,
         clientId: req.session.clientId,
      });
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const receivePaymentResult = async (req, res) => {
   let vnp_Params = req.query;
   let secureHash = vnp_Params["vnp_SecureHash"];

   let orderId = vnp_Params["vnp_TxnRef"];
   let rspCode = vnp_Params["vnp_ResponseCode"];
   let transDate = vnp_Params["vnp_PayDate"];
   let amount = vnp_Params["vnp_Amount"];

   delete vnp_Params["vnp_SecureHash"];
   delete vnp_Params["vnp_SecureHashType"];

   vnp_Params = sortObject(vnp_Params);

   let secretKey = config.vnp_HashSecret;
   let querystring = require("qs");
   let signData = querystring.stringify(vnp_Params, { encode: false });
   let crypto = require("crypto");
   let hmac = crypto.createHmac("sha512", secretKey);
   let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

   let paymentStatus = "0"; // Giả sử '0' là trạng thái khởi tạo giao dịch, chưa có IPN. Trạng thái này được lưu khi yêu cầu thanh toán chuyển hướng sang Cổng thanh toán VNPAY tại đầu khởi tạo đơn hàng.
   //let paymentStatus = '1'; // Giả sử '1' là trạng thái thành công bạn cập nhật sau IPN được gọi và trả kết quả về nó
   //let paymentStatus = '2'; // Giả sử '2' là trạng thái thất bại bạn cập nhật sau IPN được gọi và trả kết quả về nó

   let checkOrderId = true; // Mã đơn hàng "giá trị của vnp_TxnRef" VNPAY phản hồi tồn tại trong CSDL của bạn
   let checkAmount = true; // Kiểm tra số tiền "giá trị của vnp_Amout/100" trùng khớp với số tiền của đơn hàng trong CSDL của bạn
   console.log(rspCode);
   if (secureHash === signed) {
      //kiểm tra checksum
      if (checkOrderId) {
         if (checkAmount) {
            if (paymentStatus == "0") {
               //kiểm tra tình trạng giao dịch trước khi cập nhật tình trạng thanh toán
               console.log(rspCode);

               if (rspCode == "00") {
                  console.log("checking");
                  console.log(rspCode);
                  //thanh cong
                  //paymentStatus = '1'
                  // Ở đây cập nhật trạng thái giao dịch thanh toán thành công vào CSDL của bạn
                  const queryParameters = Object.keys(vnp_Params)
                     .map((key) => `${key}=${vnp_Params[key]}`)
                     .join("&");
                  const redirectURL = `${process.env.FE_SERVER}?${queryParameters}`;
                  res.redirect(redirectURL);
                  // res.status(200).json({
                  //   RspCode: '00',
                  //   Message: 'Giao dịch thành công',
                  //   info: {
                  //     orderId: orderId,
                  //     transDate: transDate,
                  //     transType: '02',
                  //     amount: amount,
                  //   },
                  // });
               } else {
                  //that bai
                  //paymentStatus = '2'
                  // Ở đây cập nhật trạng thái giao dịch thanh toán thất bại vào CSDL của bạn
                  res.redirect(`${process.env.FE_SERVER}`);
                  res.status(200).json({
                     RspCode: "24",
                     Message:
                        "Giao dịch không thành công do: Khách hàng hủy giao dịch",
                  });
               }
            } else {
               res.status(200).json({
                  RspCode: "02",
                  Message: "This order has been updated to the payment status",
               });
            }
         } else {
            res.status(200).json({ RspCode: "04", Message: "Amount invalid" });
         }
      } else {
         res.status(200).json({ RspCode: "01", Message: "Order not found" });
      }
   } else {
      res.status(200).json({ RspCode: "97", Message: "Checksum failed" });
   }
};

const vnpayReturn = async (req, res) => {
   try {
      console.log(req.session.clientId);
      let vnp_Params = req.query;

      let secureHash = vnp_Params["vnp_SecureHash"];

      delete vnp_Params["vnp_SecureHash"];
      delete vnp_Params["vnp_SecureHashType"];

      vnp_Params = sortObject(vnp_Params);

      let tmnCode = config.vnp_TmnCode;
      let secretKey = config.vnp_HashSecret;

      let querystring = require("qs");
      let signData = querystring.stringify(vnp_Params, { encode: false });
      let crypto = require("crypto");
      let hmac = crypto.createHmac("sha512", secretKey);
      let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

      if (secureHash === signed) {
         //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua

         // get info to create payment
         let name = vnp_Params["vnp_BankTranNo"];
         let description = vnp_Params["vnp_OrderInfo"];
         let amount = vnp_Params["vnp_Amount"];

         res.status(200).send({
            status: "success",
            name: name,
            description: description,
            amount: amount,
            code: vnp_Params["vnp_ResponseCode"],
         });
      } else {
         res.status(200).send({
            status: "not success",
            code: "97",
         });
      }
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const refundPayment = async (req, res) => {
   process.env.TZ = "Asia/Ho_Chi_Minh";
   let date = new Date();

   let crypto = require("crypto");

   let vnp_TmnCode = config.vnp_TmnCode;
   let secretKey = config.vnp_HashSecret;
   let vnp_Api = config.vnp_Api;

   let vnp_TxnRef = req.body.orderId;
   let vnp_TransactionDate = req.body.transDate;
   let vnp_Amount = req.body.amount;
   let vnp_TransactionType = req.body.transType;
   let vnp_CreateBy = req.body.user;

   let currCode = "VND";

   let vnp_RequestId = moment(date).format("HHmmss");
   let vnp_Version = "2.1.0";
   let vnp_Command = "refund";
   let vnp_OrderInfo = "Hoan tien GD ma:" + vnp_TxnRef;

   let vnp_IpAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

   let vnp_CreateDate = moment(date).format("YYYYMMDDHHmmss");

   let vnp_TransactionNo = "0";

   let data =
      vnp_RequestId +
      "|" +
      vnp_Version +
      "|" +
      vnp_Command +
      "|" +
      vnp_TmnCode +
      "|" +
      vnp_TransactionType +
      "|" +
      vnp_TxnRef +
      "|" +
      vnp_Amount +
      "|" +
      vnp_TransactionNo +
      "|" +
      vnp_TransactionDate +
      "|" +
      vnp_CreateBy +
      "|" +
      vnp_CreateDate +
      "|" +
      vnp_IpAddr +
      "|" +
      vnp_OrderInfo;
   let hmac = crypto.createHmac("sha512", secretKey);
   let vnp_SecureHash = hmac.update(new Buffer(data, "utf-8")).digest("hex");

   let dataObj = {
      vnp_RequestId: vnp_RequestId,
      vnp_Version: vnp_Version,
      vnp_Command: vnp_Command,
      vnp_TmnCode: vnp_TmnCode,
      vnp_TransactionType: vnp_TransactionType,
      vnp_TxnRef: vnp_TxnRef,
      vnp_Amount: vnp_Amount,
      vnp_TransactionNo: vnp_TransactionNo,
      vnp_CreateBy: vnp_CreateBy,
      vnp_OrderInfo: vnp_OrderInfo,
      vnp_TransactionDate: vnp_TransactionDate,
      vnp_CreateDate: vnp_CreateDate,
      vnp_IpAddr: vnp_IpAddr,
      vnp_SecureHash: vnp_SecureHash,
   };

   // await axios.post(vnp_Api, JSON.stringify(dataObj)).then((response) => {
   //    res.status(200).send({
   //       response: response,
   //    });
   // });

   request(
      {
         url: vnp_Api,
         method: "POST",
         json: true,
         body: dataObj,
      },
      function (error, response, body) {
         console.log(response);
         res.status(200).send({
            body: body,
         });
      }
   );
};

const sortObject = (obj) => {
   let sorted = {};
   let str = [];
   let key;
   for (key in obj) {
      if (obj.hasOwnProperty(key)) {
         str.push(encodeURIComponent(key));
      }
   }
   str.sort();
   for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
   }
   return sorted;
};

module.exports = {
   getPaymentByClientId,
   createPayment,
   createVnpayUrl,
   vnpayReturn,
   getAllPayment,
   receivePaymentResult,
   refundPayment,
   createAutoCollectFeePayment,
   getRevenue,
   getDeposit,
};
