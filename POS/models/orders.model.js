module.exports = (sequelize, Sequelize) => {
  const Orders = sequelize.define(
    "pos_orders",
    {
      orders_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      order_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      payment_method: {
        type: Sequelize.ENUM("Cash", "Online", "Card"),
        allowNull: false,
        defaultValue: "Cash",
      },
      notes: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      discount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },
      customer_phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      is_existing_customer: {
        type: Sequelize.BOOLEAN,
      },
    },
    {
      timestamps: false,
      tableName: "pos_orders",
      engine: "InnoDB",
    }
  );

  return Orders;
};
