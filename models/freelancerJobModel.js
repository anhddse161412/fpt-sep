module.exports = (sequelize, DataTypes) => {
   const FreelancerJobs = sequelize.define("freelancerJob", {
      freelancerJobId: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
   });

   return FreelancerJobs;
};
