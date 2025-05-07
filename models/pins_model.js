module.exports = (sequelize, dataTypes) => {
  const Pins = sequelize.define(
    "app_pins",
    {
      slno: {
        type: dataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      pin: {
        type: dataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      used_by_id: {
        type: dataTypes.STRING,
        unique: true,
      },
      used_by_name: {
        type: dataTypes.STRING,
      },
      used_by_phone: {
        type: dataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      used_on: {
        type: dataTypes.DATE,
      },
      status: {
        type: dataTypes.TINYINT,
      },
    },
    {
      table: "app_pins",
      timestamps: false,
    }
  );
  return Pins;
};
