module.exports = (sequelize, dataTypes) => {
  const Renewal = sequelize.define(
    "monthly_renewals",
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
    },
    {
      table: "monthly_renewals",
      timestamps: false,
    }
  );
  return Renewal;
};
