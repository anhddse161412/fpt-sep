// import controllers review, products
const categoryController = require("../controllers/categoryController");

// router
const router = require("express").Router();

// use routers
router.post("/create", categoryController.createCategory);
router.route("/").get(categoryController.getAllCategory);

router
   .route("/subCategory/:categoryID")
   .get(categoryController.getCategoryWithSubCategory);

router
   .route("/detail/:categoryID")
   .get(categoryController.getCategoryById)
   .post(categoryController.updateCategory);
module.exports = router;
