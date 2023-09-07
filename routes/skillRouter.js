const skillController = require("../controllers/skillController");

// router
const router = require("express").Router();

// use routers

router.route("/").get(skillController.getAllSkill);
module.exports = router;
