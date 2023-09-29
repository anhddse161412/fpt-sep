module.exports = (sequelize, DataTypes) => {
   const Client = sequelize.define("client", {
      status: {
         type: DataTypes.BOOLEAN,
         allowNull: false,
      },
      taxCode: {
         type: DataTypes.STRING,
      },
      companyWebsite: {
         type: DataTypes.STRING,
      },
      currency: {
         type: DataTypes.INTEGER,
         allowNull: false,
         default: 0
      },
   });

   return Client;
};
