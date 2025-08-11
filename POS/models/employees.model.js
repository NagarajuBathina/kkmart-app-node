module.exports = (sequelize, Sequelize) => {
  const Employees = sequelize.define(
    "pos_employees",
    {
      employees_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      employees_first_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      employees_last_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      employees_email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      employees_phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      tableName: "pos_employees",
      engine: "InnoDB",
    }
  );

  return Employees;
};
