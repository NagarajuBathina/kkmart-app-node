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
        references: {
          model: "customer",
          key: "slno",
        },
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      store_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      order_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
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
      customer_phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      is_existing_customer: {
        type: Sequelize.BOOLEAN,
        // allowNull: false,
      },
      store_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
