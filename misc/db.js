const Sequelize = require("sequelize");

// app
const employeeModel = require("../models/employee_model");
const customerModel = require("../models/customer_model");
const monthlyRenewalModel = require("../models/renewal_model");
const withdrawalModel = require("../models/withdrawal_model");
const employeePaymentModel = require("../models/employees_payment_model");
const employeeBankDetailsModel = require("../models/employee_bank_details_model");
const pinsModel = require("../models/pins_model");
const mandalModel = require("../models/mandals_model");
const customerPinsModel = require("../models/customer_pins_model");
const billBaordModel = require("../models/bill_board_model");

// pos
const brandsModel = require("../POS/models/brands.model.js");
const categoryModel = require("../POS/models/categories.model.js");
const customersModel = require("../POS/models/customers.model.js");
const employeesModel = require("../POS/models/employees.model.js");
const OrderItemsModel = require("../POS/models/order_items.model.js");
const ordersModel = require("../POS/models/orders.model.js");
const productsModel = require("../POS/models/products.model.js");
const storesModel = require("../POS/models/stores.model.js");
const subCategoriesModel = require("../POS/models/sub_categories.model.js");
const suppliersModel = require("../POS/models/suppliers.model.js");
const unitsModel = require("../POS/models/brands.model.js");
const usersModel = require("../POS/models/users.model.js");
const comboModel = require("../POS/models/combos.model.js");
const comboProductModel = require("../POS/models/combo_products.model.js");

const sequelize = new Sequelize("u276789778_kk_mart_new", "u276789778_kk_mart_new", "123@Newkkmart", {
  dialect: "mysql",
  host: "62.72.28.52",
  port: 3306,
  logging: false,
  pool: {
    max: 30,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// app
const Employee = employeeModel(sequelize, Sequelize);
const Customer = customerModel(sequelize, Sequelize);
const Renewal = monthlyRenewalModel(sequelize, Sequelize);
const Withdrawal = withdrawalModel(sequelize, Sequelize);
const EmployeePayment = employeePaymentModel(sequelize, Sequelize);
const EmployeeBankDetails = employeeBankDetailsModel(sequelize, Sequelize);
const Pins = pinsModel(sequelize, Sequelize);
const Mandals = mandalModel(sequelize, Sequelize);
const CustomerPins = customerPinsModel(sequelize, Sequelize);
const BillBoards = billBaordModel(sequelize, Sequelize);

//pos
const Brand = brandsModel(sequelize, Sequelize);
const Category = categoryModel(sequelize, Sequelize);
const Customers = customersModel(sequelize, Sequelize);
const Employees = employeesModel(sequelize, Sequelize);
const OrderItems = OrderItemsModel(sequelize, Sequelize);
const Orders = ordersModel(sequelize, Sequelize);
const Products = productsModel(sequelize, Sequelize);
const Stores = storesModel(sequelize, Sequelize);
const SubCategory = subCategoriesModel(sequelize, Sequelize);
const Supplier = suppliersModel(sequelize, Sequelize);
const Unit = unitsModel(sequelize, Sequelize);
const Users = usersModel(sequelize, Sequelize);
const Combo = comboModel(sequelize, Sequelize);
const ComboProduct = comboProductModel(sequelize, Sequelize);

const Models = {
  //app
  Employee,
  Customer,
  Renewal,
  Withdrawal,
  EmployeePayment,
  EmployeeBankDetails,
  Pins,
  Mandals,
  CustomerPins,
  BillBoards,

  //pos
  Brand,
  Category,
  Customers,
  Employees,
  OrderItems,
  Orders,
  Products,
  Stores,
  SubCategory,
  Supplier,
  Unit,
  Users,
  Combo,
  ComboProduct,
};
const connection = {};

module.exports = async () => {
  try {
    if (connection.isConnected) {
      console.log("=> Using existing connection.");
      return { sequelize, ...Models };
    }
    // await sequelize.sync();
    await sequelize.authenticate();
    connection.isConnected = true;
    console.log("=>Created a new connection.");
    return { sequelize, ...Models };
  } catch (error) {
    console.log("Error while connecting to database", error);
    return error;
  }
};
