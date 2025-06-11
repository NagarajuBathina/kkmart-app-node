module.exports = (sequelize, dataTypes) => {
  const CustomerPins = sequelize.define(
    "customer_pins",
    {
      slno: {
        type: dataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      pin: {
        type: dataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      created_by: {
        type: dataTypes.STRING,
      },
      created_by_name: {
        type: dataTypes.STRING,
      },
      customer_phone: {
        type: dataTypes.STRING,
        unique: true,
      },
      customer_name: {
        type: dataTypes.STRING,
      },
      status: {
        type: dataTypes.TINYINT,
      },
      used_on: {
        type: dataTypes.STRING,
      },
    },
    {
      table: "customer_pins",
      timestamps: false,
    }
  );
  return CustomerPins;
};
