module.exports = (sequelize, Sequelize) => {
  const Category = sequelize.define(
    "pos_category",
    {
      category_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      category: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      // category_slug: {
      //   type: Sequelize.STRING,
      //   allowNull: true,
      // },
      created_on: {
        type: Sequelize.DATE,
        default: Date.now(),
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: "true for active, false for inactive",
      },
    },
    {
      timestamps: false,
      tableName: "pos_category",
      engine: "InnoDB",
    }
  );

  return Category;
};
