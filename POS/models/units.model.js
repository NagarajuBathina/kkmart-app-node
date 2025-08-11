module.exports = (sequelize, Sequelize) => {
  const Unit = sequelize.define(
    "pos_units",
    {
      unit_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      unit: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      short_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      no_of_products: {
        type: Sequelize.INTEGER,
        allowNull: true,
        default: 0,
      },
      created_on: {
        type: Sequelize.DATE,
        default: new Date(),
      },
      status: {
        type: Sequelize.BOOLEAN,
        default: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        default: true,
      },
      conversion_factor: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: false,
        defaultValue: 1.0,
        comment: "Conversion to base unit (e.g. 1000 for kg->grams)",
      },
      is_base_unit: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamps: false,
      tableName: "pos_units",
      engine: "InnoDB",
    }
  );

  return Unit;
};
