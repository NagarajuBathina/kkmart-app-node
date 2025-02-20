module.exports = (sequelize, dataTypes) => {
  const Renewal = sequelize.define(
    "app_monthly_renewals",
    {
      slno: {
        type: dataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: dataTypes.STRING,
      },
      amount: {
        type: dataTypes.INTEGER,
        allowNull: false,
      },
      addedon: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      joined_by: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      transaction_id: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      payment_status: {
        type: dataTypes.STRING,
        allowNull: false,
      },
    },
    {
      table: "app_monthly_renewals",
      timestamps: false,
    }
  );
  return Renewal;
};
