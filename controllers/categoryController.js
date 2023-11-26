const db = require("../models");
// image Upload

// create main Model
const Category = db.categories;
// const SubCategory = db.subCategories;

// main work

// 1. create Category

const createCategory = async (req, res) => {
   try {
      let info = {
         name: req.body.name,
         description: req.body.description,
         status: req.body.status ? req.body.status : false,
      };

      const category = await Category.create(info);
      res.status(200).send(category);
      console.log(category);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

// 2. get all Category
const getAllCategory = async (req, res) => {
   try {
      const allCategories = await Category.findAll({
         include: [
            {
               model: Category,
               as: "categories",
            },
            {
               model: Category,
               as: "subCategories",
            },
         ],
         where: {
            parentId: null, // Chỉ lấy các categories cha (có parentId là null)
         },
      });

      res.status(200).json(allCategories);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const getCategoryById = async (req, res) => {
   try {
      let category = await Category.findOne({
         where: { id: req.params.categoryID },
      });
      res.status(200).send(category);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const updateCategory = async (req, res) => {
   try {
      let category = await Category.update(req.body, {
         where: { id: req.params.categoryID },
      });
      res.status(200).send(category);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

// 7. connect one to many relation

const getCategoryWithSubCategory = async (req, res) => {
   try {
      const subCategories = await Category.findAll({
         where: {
            parentId: req.params.categoryID,
         },
      });

      res.status(200).json(subCategories);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

module.exports = {
   createCategory,
   getCategoryById,
   getAllCategory,
   updateCategory,
   getCategoryWithSubCategory,
};
