const db = require("../models");
const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const { sign, verify, decode } = require("jsonwebtoken");
const { Sequelize } = require("sequelize");
const otpGenerator = require("otp-generator");
// image Upload

// Sequelize operation
const Op = Sequelize.Op;

// create main Model
const Account = db.accounts;
const Job = db.jobs;
const Freelancer = db.freelancers;
const Client = db.clients;
const Skill = db.skills;
const Category = db.categories;

//Util
const { sendEmail } = require("../util/sendEmail");

// main work

// 1. register account
const register = async (req, res) => {
   try {
      let info = {
         name: req.body.name,
         email: req.body.email,
         password: req.body.password,
         password: req.body.password,
         role: req.body.role ? req.body.role : "client",
         status: true,
      };
      // check dulicate
      if (
         (checkEmailDulicate = await Account.findOne({
            where: { email: req.body.email },
         }))
      ) {
         res.status(400).json({
            message: "Tài khoản email này đã được sử dụng!",
         });
      } else {
         let { token, otp } = await sendEmailOtp(req.body.email, info);
         sendEmail(
            req.body.email,
            `[FPT-SEP] Mã xác nhận tài khoản`,
            `Mã xác nhận tài khoản của bạn : ${otp}
            Lưu ý : mã xác nhận sẽ hết hạn sau 5 phút.`
         );
         res.status(200).json({
            message: "Đã gửi mã xác nhận tới email!",
            otp: otp,
            token: token,
         });
      }

      // decode password
      // const salt = genSaltSync(10);
      // info.password = hashSync(req.body.password, salt);

      // create account
      // const account = await Account.create(info);

      // if (info.role === "client") {
      //    const client = await Client.create({ status: "true" });
      //    account.setClients(client);
      // } else if (info.role === "freelancer") {
      //    const freelancer = await Freelancer.create({ status: "true" });
      //    account.setFreelancers(freelancer);
      // }

      // console.log(account.dataValues);
   } catch (error) {
      console.error(error);
      return res.status(400).json({ message: error.toString() });
   }
};

// complete register
const confirmRegister = async (req, res) => {
   try {
      let { otp, email, token } = req.body;
      let message;
      let status;
      console.log(token);
      verify(token, process.env.JWT_KEY, async (err, decoded) => {
         if (err) {
            return res.status(400).json({ message: "Error with token!" });
         } else {
            console.log(decoded);
            if (decoded.otp == otp && decoded.email == email) {
               if (
                  decoded.otp == otp &&
                  decoded.email == email &&
                  decoded.registerInfo != null
               ) {
                  let info = {
                     name: decoded.registerInfo.name,
                     email: decoded.registerInfo.email,
                     password: decoded.registerInfo.password,
                     role: decoded.registerInfo.role,
                     status: true,
                  };
                  const salt = genSaltSync(10);
                  info.password = hashSync(info.password, salt);

                  // create account
                  const account = await Account.create(info);

                  if (info.role === "client") {
                     const client = await Client.create({
                        status: "true",
                        currency: 0,
                     });
                     account.setClients(client);
                  } else if (info.role === "freelancer") {
                     const freelancer = await Freelancer.create({
                        status: "true",
                     });
                     account.setFreelancers(freelancer);
                  }
                  res.status(200).json({ message: "Tài khoản đã được tạo!" });
                  console.log(account.dataValues);
               }
            } else {
               message = "Xác thực thất bại. OTP và Email không trùng khớp";
               status = false;
               res.send({ status: status, message: message });
            }
         }
      });
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

// 2. get all account
const getAllAccount = async (req, res) => {
   try {
      let accounts = await Account.findAll({
         where: {
            role: { [Op.ne]: "admin" },
         },
      });
      res.status(200).send(accounts);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const getAccountById = async (req, res) => {
   try {
      let accounts = await Account.findOne({
         where: { id: req.params.accountId },
      });
      res.status(200).send(accounts);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const updateAccount = async (req, res) => {
   try {
      let accounts = await Account.update(req.body, {
         where: { id: req.params.accountId },
      });
      res.status(200).send(accounts);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const login = async (req, res) => {
   try {
      const account = await Account.findOne({
         attributes: { exclude: ["createdAt", "updatedAt"] },
         where: { email: req.body.email },
      });
      console.log(account);

      if (!account) {
         return res.status(400).json({
            message: "Email không khả dụng!",
         });
      }

      if (account.status == false) {
         return res.status(400).json({
            message: "Tài khoản này đã bị vô hiệu hóa!",
         });
      }

      const checkPassword = compareSync(req.body.password, account.password);
      if (checkPassword) {
         const jsontoken = sign({ result: account }, process.env.JWT_KEY, {
            expiresIn: "1h",
         });
         res.status(201).json({
            success: 1,
            message: "Đăng nhập thành công!",
            token: jsontoken,
            account: account,
         });
      } else {
         res.status(403).json({
            message: "Email hoặc mật khẩu không đúng!",
         });
      }
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const isLoggedIn = (req, res, next) => {
   req.user ? next() : res.sendStatus(401);
};

const loginGoogle = async (req, res) => {
   try {
      let account = await Account.findOne({
         where: { email: req.body.email },
      });
      if (!account) {
         const salt = genSaltSync(10);
         let info = {
            name: req.body.name,
            image: req.body.image,
            email: req.body.email,
            password: hashSync(req.body.googleId, salt),
            currency: 0,
            role: "freelancer",
            status: 1,
         };
         const newAccount = await Account.create(info);
         const freelancer = await Freelancer.create({ status: "true" });
         newAccount.setFreelancers(freelancer);
         account = newAccount;
      } else {
         if (account.status == false) {
            return res.status(400).json({
               message: "Tài khoản này đã bị vô hiệu hóa!",
            });
         }
      }

      const jsontoken = sign({ result: account }, process.env.JWT_KEY, {
         expiresIn: "1h",
      });
      res.status(200).json({
         token: jsontoken,
         message: "Đăng nhập thành công!",
      });
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const getAccountWithJobId = async (req, res) => {
   const data = await Account.findAll({
      include: [
         {
            model: Job,
            as: "jobs",
         },
      ],
      where: { id: req.params.accountId },
   });

   res.status(200).send(data);
};

const getFavoriteJobOfAccount = async (req, res) => {
   try {
      let limit = Number(req.query.limit) || null;
      let page = Number(req.query.page) || null;

      if (!limit && page) {
         limit = 10;
      } else if (limit && !page) {
         page = 1;
      }

      if (limit && page && (limit <= 0 || page <= 0)) {
         return res
            .status(400)
            .json({ message: "Invalid limit or page number" });
      }

      let offset = (page - 1) * limit;

      const { count, rows: jobs } = await Job.findAndCountAll({
         include: [
            {
               model: Account,
               as: "accounts",
               where: { id: req.params.accountId },
            },
            {
               model: Category,
               as: "subcategories",
               attributes: ["name"],
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
            {
               model: Skill,
               as: "skills",
               attributes: { exclude: ["createdAt", "updatedAt"] },
            },
         ],
         distinct: true,
         limit,
         where: { status: "open" },
         offset,
         order: [["updatedAt", "DESC"]],
      });

      const totalPages = Math.ceil(count / limit);

      res.status(200).json({
         jobs,
         pagination: {
            totalItems: count,
            totalPages,
            currentPage: page,
            itemsPerPage: limit,
         },
      });
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const forgorPassword = async (req, res) => {
   try {
      const { email } = req.body;
      await Account.findOne({ where: { email: email } }).then(
         async (account) => {
            if (!account) {
               return res
                  .status(400)
                  .json({ message: "Email này chưa được đăng kí" });
            }
            let { token, otp } = await sendEmailOtp(account.email, "");
            sendEmail(
               email,
               "[FPT-SEP] Mã xác nhận đặt lại mật khẩu",
               `Đây là mã xác nhận đặt lại mật khẩu của bạn : ${otp}
               .Mã xác nhận có hiệu lực trong vòng 5 phút`
            );
            res.status(200).send({
               message: "Đã gửi mail thành công",
               otp: otp,
               token: token,
            });
         }
      );
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }

   // res.status(200).send({
   //    message: "da gui toi gmail cua ban link reset password",
   // });
};

const resetPassword = async (req, res) => {
   try {
      const { email, password } = req.body;
      const salt = genSaltSync(10);
      newPassword = hashSync(password, salt);
      let account = await Account.findOne({
         where: { email: email },
      });
      account.setDataValue("password", newPassword);
      account
         .save()
         .then((u) => res.send({ Status: "Success" }))
         .catch((err) => res.send({ Status: err }));
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const changePassword = async (req, res) => {
   try {
      let account = await Account.findOne({
         where: { id: req.params.accountId },
      });

      const checkPassword = compareSync(req.body.oldPassword, account.password);
      if (checkPassword) {
         // decode password
         const salt = genSaltSync(10);
         let newPassword = hashSync(req.body.newPassword, salt);

         account.setDataValue("password", newPassword);
         account.save();

         res.status(200).send("Đổi mật khẩu thành công!");
      } else {
         res.status(403).json({
            message: "Mật khẩu cũ không đúng!",
         });
      }
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const deactiveAccount = async (req, res) => {
   try {
      let account = await Account.findOne({
         where: { id: req.params.accountId },
      });

      account.setDataValue("status", false);
      account.save();

      sendEmail(
         account.email,
         `[FPT-SEP] Tài khoản của bạn đã bị vô hiệu hóa`,
         `Xin chào,

Chúng tôi xin thông báo rằng tài khoản của bạn đã bị vô hiệu hóa. Lý do vô hiệu hóa tài khoản là do vi phạm các điều khoản và quy định của chúng tôi. Nếu bạn có bất kỳ thắc mắc nào hoặc cần hỗ trợ, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại hỗ trợ khách hàng.
         
Trân trọng,`
      );

      res.status(200).send("Đã đóng tài khoản!");
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const activeAccount = async (req, res) => {
   try {
      let account = await Account.findOne({
         where: { id: req.params.accountId },
      });

      account.setDataValue("status", true);
      account.save();

      sendEmail(
         account.email,
         `[FPT-SEP] Tài khoản của bạn đã được tái kích hoạt`,
         `Xin chào,

Chúng tôi xin thông báo rằ tài khoản của bạn đã được tái kích hoạt thành công. Bây giờ bạn có thể truy cập và sử dụng tài khoản như bình thường. Nếu bạn có bất kỳ thắc mắc nào hoặ cần hỗ trợ, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại hỗ tr khách hàng.
         
Trân trọng,`
      );

      res.status(200).send("Đã tái kích hoạt tài khoản!");
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const sendEmailOtp = async (email, registerInfo) => {
   try {
      let otp = otpGenerator.generate(6, {
         digits: true,
         specialChars: false,
         lowerCaseAlphabets: false,
         upperCaseAlphabets: false,
      });
      const token = sign(
         { registerInfo: registerInfo, email: email, otp: otp },
         process.env.JWT_KEY,
         {
            expiresIn: "5m",
         }
      );
      return {
         token: token,
         otp: otp,
      };
   } catch (error) {
      console.error(error);
   }
};

const verifyEmailOtp = async (req, res) => {
   try {
      let { email, otp, token } = req.body;

      console.log(token);
      let message;
      let status;
      verify(token, process.env.JWT_KEY, async (err, decoded) => {
         if (err) {
            return res.status(400).json({ message: "Error with token!" });
         } else {
            console.log(decoded);
            if (decoded.otp == otp && decoded.email == email) {
               message = "Xác thực thành công. OTP và Email trùng khớp";
               status = true;
            } else {
               message = "Xác thực thất bại. OTP và Email không trùng khớp";
               status = false;
            }
            res.send({ status: status, message: message });
         }
      });
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const searchAccountAndJob = async (req, res) => {
   try {
      let resultList = [];
      let searchInput = req.body.searchInput;
      // await Account.findAll({
      //    where: { name: { [db.Op.like]: `%${searchInput}%` }, status: 1 },
      // }).then((res) => {
      //    res.forEach(async (item) => {
      //       resultList.push({ id: item.id, name: item.name, tag: item.role });
      //    });
      // });
      await Freelancer.findAll({
         include: [
            {
               model: Account,
               as: "accounts",
               where: { name: { [db.Op.like]: `%${searchInput}%` }, status: 1 },
            },
         ],
      }).then((res) => {
         res.forEach(async (item) => {
            resultList.push({
               id: item.accounts.id,
               name: item.accounts.name,
               tag: "freelancer",
               referId: item.id,
            });
         });
      });

      await Client.findAll({
         include: [
            {
               model: Account,
               as: "accounts",
               where: { name: { [db.Op.like]: `%${searchInput}%` }, status: 1 },
            },
         ],
      }).then((res) => {
         res.forEach(async (item) => {
            resultList.push({
               id: item.accounts.id,
               name: item.accounts.name,
               tag: "client",
               referId: item.id,
            });
         });
      });

      await Job.findAll({
         where: { title: { [db.Op.like]: `%${searchInput}%` }, status: "open" },
         order: [["updatedAt", "DESC"]],
      }).then((res) => {
         res.forEach(async (item) => {
            resultList.push({ id: item.id, title: item.title, tag: "job" });
         });
      });
      res.status(200).send({ searchList: resultList });
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

module.exports = {
   register,
   getAccountById,
   getAllAccount,
   updateAccount,
   getAccountWithJobId,
   login,
   isLoggedIn,
   loginGoogle,
   getFavoriteJobOfAccount,
   forgorPassword,
   resetPassword,
   changePassword,
   deactiveAccount,
   activeAccount,
   verifyEmailOtp,
   confirmRegister,
   searchAccountAndJob,
};
