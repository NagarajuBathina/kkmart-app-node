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
      adhaar: {
        type: dataTypes.STRING,
        unique: true,
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
    },
    {
      tableName: "app_customers",
      timestamps: false,
    }
  );
  return Customer;
};
