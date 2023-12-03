module.exports = (sequelize, DataTypes) => {
   const Client = sequelize.define("client", {
      status: {
         type: DataTypes.BOOLEAN,
         allowNull: false,
      },
      taxCode: {
         type: DataTypes.STRING(15),
      },
      companyWebsite: {
         type: DataTypes.STRING(100),
      },
      introduction: {
         type: DataTypes.TEXT,
      },
      currency: {
         type: DataTypes.INTEGER,
         allowNull: false,
         default: 0,
      },
   });

   return Client;
};
