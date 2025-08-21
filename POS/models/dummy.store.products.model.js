module.exports = (sequelize, Sequelize) => {
  const DummyStoreProducts = sequelize.define(
    "pos_dummy_store_products",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "pos_products",
          key: "products_id",
        },
      },
      store_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "pos_stores",
          key: "store_id",
        },
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
      checked_on: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      confirmed_on: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: false,
      tableName: "pos_dummy_store_products",
      engine: "InnoDB",
    }
  );

  return DummyStoreProducts;
};
