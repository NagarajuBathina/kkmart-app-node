module.exports = (sequelize, Sequelize) => {
  const Customers = sequelize.define(
    "pos_customers",
    {
      customers_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      customer_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      customer_email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      customer_phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      discount: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      timestamps: false,
      tableName: "pos_customers",
      engine: "InnoDB",
    }
  );

  return Customers;
};
