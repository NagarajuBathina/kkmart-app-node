const express = require("express");
const axios = require("axios");
const bodyparser = require("body-parser");
const cors = require("cors");
const connectTodb = require("./misc/db");
const dotenv = require("dotenv");
dotenv.config();

//app routes
const employeeRoute = require("./routes/employee_route");
const levelRoute = require("./routes/level_route");
const customerRoute = require("./routes/cutsomer_route");
const withdrawalRoute = require("./routes/withdrawal_route");
const detailsRoute = require("./routes/details_route");
const adminRoute = require("./routes/admin_route");
const employeeBankDetailsRoute = require("./routes/bank_details_route");

//pos routes
const productRoute = require("./POS/routes/products.route");
const orderRoute = require("./POS/routes/orders.route");
const authRoute = require("./POS/routes/auth.route");
const categoryRoute = require("./POS/routes/categories.route");
const brandRoute = require("./POS/routes/brand.route");
const unitRoute = require("./POS/routes/unit.route");
const subCategoryRoute = require("./POS/routes/sub_categories.route");
const supplierRoute = require("./POS/routes/suppliers.route");
const comboRoute = require("./POS/routes/combo.route");
const storeRoute = require("./POS/routes/store.route");
const userRoute = require("./POS/routes/users.route");

const app = express();

const PORT = process.env.PORT || 1431;

//middlewares
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

//app
app.use(employeeRoute);
app.use(levelRoute);
app.use(customerRoute);
app.use(withdrawalRoute);
app.use(detailsRoute);
app.use(adminRoute);
app.use(employeeBankDetailsRoute);
//pos
app.use(productRoute);
app.use(orderRoute);
app.use(authRoute);
app.use(categoryRoute);
app.use(brandRoute);
app.use(unitRoute);
app.use(subCategoryRoute);
app.use(supplierRoute);
app.use(comboRoute);
app.use(storeRoute);
app.use(userRoute);

app.use("/uploads", express.static("uploads"));

app.get("/", async (req, res) => {
  try {
    await connectTodb();
    console.log("Connection successful. ");
    return res.status(200).json({ message: "connection successful" });
  } catch (e) {
    return res.status(500).send("couldnt connect to database");
  }
});

//server running
app.listen(PORT, () => {
  console.log(`server is running at port ${PORT}`);
});
