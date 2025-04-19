const Sequelize = require("sequelize");
const employeeModel = require("../models/employee_model");
const customerModel = require("../models/customer_model");
const monthlyRenewalModel = require("../models/renewal_model");
const withdrawalModel = require("../models/withdrawal_model");
const employeePaymentModel = require("../models/employees_payment_model");
const employeeBankDetailsModel = require("../models/employee_bank_details_model");
const sequelize = new Sequelize("u276789778_kk_mart", "u276789778_kk_mart", "kkmart@123@Apple", {
  dialect: "mysql",
  host: "62.72.28.52",
  port: 3306,
  logging: false,
  pool: {
    max: 3,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

const Employee = employeeModel(sequelize, Sequelize);
const Customer = customerModel(sequelize, Sequelize);
const Renewal = monthlyRenewalModel(sequelize, Sequelize);
const Withdrawal = withdrawalModel(sequelize, Sequelize);
const EmployeePayment = employeePaymentModel(sequelize, Sequelize);
const EmployeeBankDetails = employeeBankDetailsModel(sequelize, Sequelize);

const Models = { Employee, Customer, Renewal, Withdrawal, EmployeePayment, EmployeeBankDetails };
const connection = {};

module.exports = async () => {
  try {
    if (connection.isConnected) {
      console.log("=> Using existing connection.");
      return { sequelize, ...Models };
    }
    await sequelize.sync();
    await sequelize.authenticate();
    connection.isConnected = true;
    console.log("=>Created a new connection.");
    return { sequelize, ...Models };
  } catch (error) {
    console.log("Error while connecting to database", error);
    return error;
  }
};
