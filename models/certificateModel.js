module.exports = (sequelize, DataTypes) => {
   const Certificate = sequelize.define("certificate", {
      name: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      issuingOrganization: {
         type: DataTypes.STRING,
         allowNull: true,
      },
      issueDate: {
         type: DataTypes.STRING,
         allowNull: true,
      },
      expirationDate: {
         type: DataTypes.STRING,
         allowNull: true,
      },
      credentialId: {
         type: DataTypes.STRING,
         allowNull: true,
      },
      credentialUrl: {
         type: DataTypes.STRING,
         allowNull: true,
      },
   });

   return Certificate;
};