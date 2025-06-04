module.exports = (sequelize, dataTypes) => {
  const Mandals = sequelize.define(
    "mandals",
    {
      slno: {
        type: dataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      mandal: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      district: {
        type: dataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "mandals",
      timestamps: false,
    }
  );
  return Mandals;
};
