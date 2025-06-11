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
      father_name: {
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

      adhaar: {
        type: dataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      address: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      pincode: {
        type: dataTypes.STRING,
        allowNull: false,
      },

      dob: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      gender: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      profile: {
        type: dataTypes.TEXT("long"),
      },
      nominee_name: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      nominee_phone: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      nominee_dob: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      nominee_relation: {
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
