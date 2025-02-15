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
        unique: true,
      },
      phone: {
        type: dataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      pan: {
        type: dataTypes.STRING,
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
      joined_by: {
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
      mma_count: {
        type: dataTypes.INTEGER,
      },
      sma_count: {
        type: dataTypes.INTEGER,
      },
      jma_count: {
        type: dataTypes.INTEGER,
      },
      customer_count: {
        type: dataTypes.INTEGER,
      },
      direct_mma_count: {
        type: dataTypes.INTEGER,
      },
      level1_mma_count: {
        type: dataTypes.INTEGER,
      },
      level2_mma_count: {
        type: dataTypes.INTEGER,
      },
      position: {
        type: dataTypes.INTEGER,
      },
      status: {
        type: dataTypes.INTEGER,
      },
      id: {
        type: dataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      earnings: {
        type: dataTypes.DECIMAL(10, 2),
      },
      deductions: {
        type: dataTypes.DECIMAL(10, 2),
      },
      profile: {
        type: dataTypes.TEXT("long"),
      },
      place_of_posting: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      offer_letter: {
        type: dataTypes.TEXT("long"),
      },
      name_on_idcard: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      daily_earnings: {
        type: dataTypes.DECIMAL(10, 2),
      },
      bank_no: {
        type: dataTypes.STRING,
      },
      ifsc_code: {
        type: dataTypes.STRING,
      },
      nominee_name: {
        type: dataTypes.STRING,
      },
      nominee_phone: {
        type: dataTypes.STRING,
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
