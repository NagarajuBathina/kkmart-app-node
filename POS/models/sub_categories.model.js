const e = require("cors");

module.exports = (sequelize, Sequelize) => {
  const SubCategory = sequelize.define(
    "pos_sub_category",
    {
      sub_category_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      sub_category: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
      },
      created_on: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: new Date(),
      },
      updated_on: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      timestamps: false,
      tableName: "pos_sub_category",
      engine: "InnoDB",
    }
  );

  return SubCategory;
};
