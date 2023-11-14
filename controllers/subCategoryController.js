const db = require("../models");
const { Sequelize } = require("sequelize");
// image Upload

// Sequelize operation
const Op = Sequelize.Op;

// create main Model
// const SubCategory = db.subCategories;
const Category = db.categories;

// main work

// 1. create SubCategory

const createSubCategory = async (req, res) => {
   try {
      let info = {
         name: req.body.name,
         description: req.body.description,
         category_id: req.body.category_id ? req.body.category_id : null,
         status: req.body.status ? req.body.status : false,
      };

      const subCategory = await Category.create(info);
      res.status(200).send(subCategory);
      console.log(subCategory);
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

// 2. get all SubCategory
const getAllSubCategory = async (req, res) => {
   try {
      let categories = await Category.findAll({
         include: [
            {
               model: Category,
               as: "categories",
               attributes: { exclude: ["createdAt", "updatedAt"] },
            },
         ],
         attributes: { exclude: ["createdAt", "updatedAt"] },
         where: {
            parentId: { [Op.not]: null },
         },
      });

      res.status(200).send(categories);
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

const getSubCategoryById = async (req, res) => {
   try {
      let subCategory = await Category.findOne({
         include: [
            {
               model: Category,
               as: "subCategories",
               attributes: { exclude: ["createdAt", "updatedAt"] },
            },
         ],
         attributes: { exclude: ["createdAt", "updatedAt"] },
         where: {
            id: req.params.subCategoryID,
            parentId: { [Op.not]: null },
         },
      });
      res.status(200).send(subCategory);
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

const updateSubCategory = async (req, res) => {
   try {
      let subCategory = await Category.update(req.body, {
         where: { id: req.params.subCategoryID },
      });
      res.status(200).send(subCategory);
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

const getSubCategoryWithCategoryId = async (req, res) => {
   try {
      let subCategories = await Category.findAll({
         include: [
            {
               model: Category,
               as: "categories",
               attributes: { exclude: ["createdAt", "updatedAt"] },
            },
         ],
         attributes: { exclude: ["createdAt", "updatedAt"] },
         where: { parentId: req.params.categoryID },
      });
      res.status(200).send(subCategories);
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

module.exports = {
   createSubCategory,
   getSubCategoryById,
   getAllSubCategory,
   updateSubCategory,
   getSubCategoryWithCategoryId,
};
