module.exports = (sequelize, Sequelize) => {
  const StoreProducts = sequelize.define(
    "pos_store_products",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      store_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      remarks: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      remarks_quantity: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("Pending", "Checked", "Confirmed"),
        defaultValue: "Pending",
      },
      added_on: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    },
    {
      timestamps: false,
      tableName: "pos_store_products",
      engine: "InnoDB",
    }
  );

  return StoreProducts;
};
