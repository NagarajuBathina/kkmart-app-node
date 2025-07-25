const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const BillBoards = sequelize.define(
    "BillBoards",
    {
      slno: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      image: {
        // LONGTEXT in MySQL
        type: DataTypes.TEXT("long"),
        // allowNull: false,
      },
    },
    {
      tableName: "billboards",
      timestamps: false,
    }
  );

  return BillBoards;
};
