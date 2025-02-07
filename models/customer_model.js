module.exports = (sequelize, dataTypes) => {
  const Customer = sequelize.define(
    "app_customers",
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
        unique: true,
      },
      joined_by: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      addedon: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: dataTypes.INTEGER,
        allowNull: false,
      },
      smart_card_number: {
        type: dataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      tableName: "app_customers",
      timestamps: false,
    }
  );
  return Customer;
};
