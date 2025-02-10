const express = require("express");
const axios = require("axios");
const bodyparser = require("body-parser");
const cors = require("cors");
const connectTodb = require("./misc/db");
const dotenv = require("dotenv");
dotenv.config();

const employeeRoute = require("./routes/employee_route");
const levelRoute = require("./routes/level_route");
const customerRoute = require("./routes/cutsomer_route");
const withdrawalRoute = require("./routes/withdrawal_route");
const detailsRoute = require("./routes/details_route");

const app = express();

const PORT = 1000;

app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

app.use(employeeRoute);
app.use(levelRoute);
app.use(customerRoute);
app.use(withdrawalRoute);
app.use(detailsRoute);

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

app.listen(PORT, () => {
  console.log(`server is running at port ${PORT}`);
});
