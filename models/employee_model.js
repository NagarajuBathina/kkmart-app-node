module.exports = (sequelize, dataTypes) => {
  const Employee = sequelize.define(
    "app_employees",
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
      dob: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      adhaar: {
        type: dataTypes.BIGINT,
        allowNull: false,
        unique: true,
      },
      phone: {
        type: dataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      city: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      pincode: {
        type: dataTypes.INTEGER,
        allowNull: false,
      },
      password: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: dataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "app_employees",
      engine: "InnoDB",
      timestamps: false,
    }
  );

  return Employee;
};
