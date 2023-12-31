// import controllers review, products
const subCategoryController = require("../controllers/subCategoryController");

// router
const router = require("express").Router();

// use routers
router.post("/create", subCategoryController.createSubCategory);
router.route("/").get(subCategoryController.getAllSubCategory);

router
   .route("/category/:categoryID")
   .get(subCategoryController.getSubCategoryWithCategoryId);

router
   .route("/detail/:subCategoryID")
   .get(subCategoryController.getSubCategoryById)
   .put(subCategoryController.updateSubCategory);

module.exports = router;
