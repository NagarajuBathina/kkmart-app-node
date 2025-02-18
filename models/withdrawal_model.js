module.exports = (sequelize, dataTypes) => {
  const Withdrawal = sequelize.define(
    "app_withdrawls",
    {
      slno: {
        type: dataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: dataTypes.INTEGER,
        allowNull: false,
      },
      addedon: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      referrel_code: {
        type: dataTypes.STRING,
        allowNull: false,
      },
    },
    {
      table: "app_withdrawls",
      timestamps: false,
    }
  );
  return Withdrawal;
};
