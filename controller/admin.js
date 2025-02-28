const connectTodb = require("../misc/db");
const { where } = require("sequelize");

const allEmployeesData = async (req, res) => {
  try {
    const { Employee } = await connectTodb();
    const allData = await Employee.findAll({
      order: [["addedon", "DESC"]],
    });

    if (!allData || allData.length === 0) {
      return res.status(404).json({ message: "No employees found" });
    }

    return res.status(200).json({
      success: true,
      count: allData.length,
      data: allData,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};

const allCustomersData = async (req, res) => {
  try {
    const { Customer } = await connectTodb();
    const allData = await Customer.findAll({ oders: [["addedon", "DESC"]] });
    if (!allData || allData.length === 0) {
      return res.status(404).json({ message: "No customers found" });
    }
    return res.status(200).json({
      success: true,
      count: allData.length,
      data: allData,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};

const allMonthlyRenewalsData = async (req, res) => {
  try {
    const { Renewal } = await connectTodb();
    const allData = await Renewal.findAll({ order: [["addedon", "DESC"]] });
    if (!allData || allData.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }
    return res.status(200).json({
      success: true,
      count: allData.length,
      data: allData,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};

const allWithdrawlsData = async (req, res) => {
  try {
    const { Withdrawal } = await connectTodb();
    const allData = await Withdrawal.findAll({ order: [["addedon", "DESC"]] });
    if (!allData || allData.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }
    return res.status(200).json({
      success: true,
      count: allData.length,
      data: allData,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};

const allEmployeesPaymentsData = async (req, res) => {
  try {
    const { EmployeePayment } = await connectTodb();
    const allData = await EmployeePayment.findAll({ order: [["addedon", "DESC"]] });
    if (!allData || allData.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }
    return res.status(200).json({
      success: true,
      count: allData.length,
      data: allData,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};

const EmployeeFullDetailsById = async (req, res) => {
  try {
    const { Employee, EmployeeBankDetails } = await connectTodb();
    const employeeData = await Employee.findOne({ where: { phone: req.params.phone } });

    const employeeBankDetails = await EmployeeBankDetails.findOne({ where: { phone: req.params.phone } });
    if (!employeeBankDetails || employeeBankDetails.length === 0) {
      console.log("no bank details found");
    }

    return res.status(200).json({ EmployeeData: employeeData, EmployeeBankDetails: employeeBankDetails });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const updateEmployeeDetails = async (req, res) => {
  try {
    const { EmployeeBankDetails } = await connectTodb();
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    const [updated] = await EmployeeBankDetails.update(req.body, { where: { phone } });

    if (updated === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    return res.status(200).json({ message: "Updated successfully" });
  } catch (error) {
    console.error("Error updating employee details:", error);
    return res.status(500).json({ error: error.message });
  }
};

const getDashBoardDetails = async (req, res) => {
  try {
    const { Employee, Customer } = await connectTodb();
    const getMMA = await Employee.findAll({ where: { role: "mma" } });
    if (!getMMA || getMMA.length === 0) {
      console.log("no mma data found");
    }
    const getSMA = await Employee.findAll({ where: { role: "sma" } });
    if (!getSMA || getSMA.length === 0) {
      console.log("no sma data found");
    }
    const getJMA = await Employee.findAll({ where: { role: "jma" } });
    if (!getJMA || getJMA.length === 0) {
      console.log("no jma data found");
    }
    const getDMH = await Employee.findAll({ where: { role: "dmh" } });
    if (!getDMH || getDMH.length === 0) {
      console.log("no dmh data found");
    }
    const getZMH = await Employee.findAll({ where: { role: "zmh" } });
    if (!getZMH || getZMH.length === 0) {
      console.log("no zmh data found");
    }

    const getSMH = await Employee.findAll({ where: { role: "smh" } });
    if (!getSMH || getSMH.length === 0) {
      console.log("no smh data found");
    }

    const getCustomers = await Customer.findAll({ attributes: ["addedon"] });
    if (!getCustomers || getCustomers.length === 0) {
      console.log("no customer data found");
    }

    // Group customers by month and year
    const customersByMonthYear = getCustomers.reduce((acc, customer) => {
      const date = new Date(customer.addedon);
      const month = date.getMonth() + 1; // Months are zero-based
      const year = date.getFullYear();
      const key = `${year}-${month < 10 ? "0" : ""}${month}`;

      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(customer);

      return acc;
    }, {});

    // Extract the length of each month's data
    const monthlyDataCounts = Object.keys(customersByMonthYear).map((key) => {
      const [year, month] = key.split("-");
      return {
        year: parseInt(year, 10),
        month: parseInt(month, 10),
        count: customersByMonthYear[key].length,
      };
    });

    return res.status(200).json({
      data: {
        mma: getMMA.length,
        sma: getSMA.length,
        jma: getJMA.length,
        dmh: getDMH.length,
        zmh: getZMH.length,
        smh: getSMH.length,
        customer: getCustomers.length,
        monthlyDataCounts,
      },
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

module.exports = {
  allEmployeesData,
  allMonthlyRenewalsData,
  allCustomersData,
  allWithdrawlsData,
  allEmployeesPaymentsData,
  EmployeeFullDetailsById,
  updateEmployeeDetails,
  updateEmployeeDetails,
  getDashBoardDetails,
};
