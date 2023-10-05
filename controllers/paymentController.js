const { Model } = require("sequelize");
const config = require("../config/vnpayConfig");
const db = require("../models");
const moment = require("moment");
const { create } = require("domain");
const Payment = db.payments;
const Client = db.clients;

const createPayment = async (req, res) => {
   try {
      let info = {
         amount: req.session.amount,
         name: req.session.name,
         description: req.session.description,
         type: "deposit",
      };
      let clientId = req.session.clientId;
      console.log(clientId);
      createPayment(info, clientId);
      const payment = Payment.create(info);
      const client = await Client.findOne({
         where: { id: clientId },
      });
      client.addPayment(payment);
   } catch (error) {
      console.log(error);
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
      console.log(error);
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
         req.session.name = vnp_Params["vnp_BankTranNo"];
         req.session.description = vnp_Params["vnp_OrderInfo"];
         req.session.amount = vnp_Params["vnp_Amount"];

         res.status(200).send({
            status: "success",
            code: vnp_Params["vnp_ResponseCode"],
         });
      } else {
         res.status(200).send({
            status: "success",
            code: "97",
         });
      }
   } catch (error) {
      console.log(error);
   }
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
   createVnpayUrl,
   vnpayReturn,
};
