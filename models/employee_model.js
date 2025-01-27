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
        type: dataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      phone: {
        type: dataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      city: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      pincode: {
        type: dataTypes.STRING,
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
      reffered_by: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      refferel_code: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      addedon: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      role: {
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
