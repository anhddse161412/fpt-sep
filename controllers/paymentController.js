const db = require("../models");
const config = require("../config/vnpayConfig");

const moment = require("moment");
const Payment = db.payments;
const Client = db.clients;

const getAllPayment = async (req, res) => {
   try {
      let payments = await Payment.findAll({});
      res.status(200).send(payments);
   } catch (error) {
      console.log(error);
   }
};

const getPaymentByClientId = async (req, res) => {
   try {
      let payments = await Payment.findAll({
         where: { clientId: req.params.clientId },
      });
      let client = await Client.findOne({
         where: { id: req.params.clientId },
      });
      res.status(200).send({
         payment: payments,
         clientCurrency: client.currency,
      });
   } catch (error) {
      console.log(error);
   }
};

const createPayment = async (req, res) => {
   try {
      let info = {
         amount: req.body.amount,
         name: req.body.name,
         description: req.body.description,
         status: true,
         type: "deposit",
      };
      let clientId = req.body.clientId;

      const payment = await Payment.create(info);
      const client = await Client.findOne({
         where: { id: clientId },
      });

      // update client's currency
      let newCurrencyValue = client.currency + parseInt(info.amount);
      client.setDataValue("currency", newCurrencyValue);
      client.save();
      //
      client.addPayment(payment);
      res.status(200).send({ message: "Luu giao dich thanh cong" });
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
      // res.status(200).send({
      //    vnpUrl: vnpUrl,
      //    clientId: req.session.clientId,
      // });
      res.redirect(vnpUrl);
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
   getPaymentByClientId,
   createPayment,
   createVnpayUrl,
   vnpayReturn,
   getAllPayment,
};
