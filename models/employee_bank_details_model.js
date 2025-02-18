module.exports = (sequelize, dataTypes) => {
  const EmployeeBankDetails = sequelize.define(
    "app_employees_bank_details",
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
      adhaar: {
        type: dataTypes.STRING,
        allowNull: null,
      },
      pan: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      refferel_code: {
        type: dataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      addedon: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      bank_ac_no: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      ifsc_code: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      branch_name: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      nominee_name: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      nominee_phone: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      nominee_adhaar: {
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
      tableName: "app_employees_bank_details",
      engine: "InnoDB",
      timestamps: false,
    }
  );
  return EmployeeBankDetails;
};
