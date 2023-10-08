// import controllers review, products
const categoryController = require("../controllers/categoryController");

// router
const router = require("express").Router();

// use routers
router
   .route("/")
   .get(categoryController.getAllCategory)
   .post(categoryController.createCategory);

router
   .route("/subCategory/:categoryID")
   .get(categoryController.getCategoryWithSubCategory);

router
   .route("/detail/:categoryID")
   .get(categoryController.getCategoryById)
   .put(categoryController.updateCategory);

module.exports = router;
