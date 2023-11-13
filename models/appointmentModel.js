module.exports = (sequelize, DataTypes) => {
   const Appointment = sequelize.define("appointment", {
      appointmentId: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
      location: {
         type: DataTypes.STRING,
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
         type: DataTypes.STRING,
         allowNull: true,
      },
   });

   return Appointment;
};
