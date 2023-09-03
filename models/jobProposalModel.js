module.exports = (sequelize, DataTypes) => {
   const JobProposal = sequelize.define("jobproposal", {
      jobProposalId: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
   });

   return JobProposal;
};
