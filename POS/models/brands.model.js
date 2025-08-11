module.exports = (sequelize, Sequelize) => {
  const Brand = sequelize.define(
    "pos_brands",
    {
      brand_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      brand: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      logo: {
        type: Sequelize.TEXT("long"),
        allowNull: true,
        comment: "Base64 encoded brand logo image",
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: "true for active, false for inactive",
      },
      created_on: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: "true for active, false for inactive",
      },
      updated_on: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    },
    {
      timestamps: false,
      tableName: "pos_brands",
      engine: "InnoDB",
    }
  );

  return Brand;
};
