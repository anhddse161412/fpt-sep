module.exports = (sequelize, DataTypes) => {
   const Appointment = sequelize.define("appointment", {
      appointmentId: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
      location: {
         type: DataTypes.STRING(100),
         allowNull: true,
      },
      link: {
         type: DataTypes.STRING,
         allowNull: true,
      },
      time: {
         type: DataTypes.DATE,
         allowNull: true,
      },
      status: {
         type: DataTypes.STRING(50),
         allowNull: true,
      },
   });

   return Appointment;
};
