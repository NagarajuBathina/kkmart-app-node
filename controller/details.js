const { where } = require("sequelize");
const connectTodb = require("../misc/db");

const getDetailsByRole = async (req, res) => {
  try {
    const { Employee } = await connectTodb();
    const { refferalCode, role } = req.body;
    console.log(req.body);

    const fetchedData = await Employee.findAll({ where: { joined_by: refferalCode, role: role } });

    if (!fetchedData || fetchedData.length === 0) {
      return res.status(400).json("no data available");
    }

    return res.status(200).json({ data: fetchedData });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};

const getDetailsOfJMAandCustomers = async (req, res) => {
  try {
    const { Employee, Customer } = await connectTodb();
    const { refferalCode, role } = req.body;
    console.log(req.body);

    const mmaList = await Employee.findAll({ where: { joined_by: refferalCode, role: "mma" } });

    if (!mmaList || mmaList.length === 0) {
      return res.status(400).json("No MMA data available");
    }

    let allJMAdata = [];
    let allCustomerData = [];

    for (const mma of mmaList) {
      const smaList = await Employee.findAll({ where: { joined_by: mma.dataValues.refferel_code, role: "sma" } });

      for (const sma of smaList) {
        const jmaList = await Employee.findAll({ where: { joined_by: sma.dataValues.refferel_code, role: "jma" } });
        console.log(jmaList);
        allJMAdata = [...allJMAdata, ...jmaList];
      }
    }

    if (allJMAdata.length === 0) {
      return res.status(400).json("No JMA data available");
    }

    for (const jma of allJMAdata) {
      const customerList = await Customer.findAll({ where: { joined_by: jma.dataValues.refferel_code } });
      console.log(customerList);
      allCustomerData = [...customerList];
    }

    if (allCustomerData.length === 0) {
      return res.status(400).json("No customer data available");
    }

    return res.status(200).json({ data: { jmaData: allJMAdata, customerData: allCustomerData } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const getCustomersDetails = async (req, res) => {
  try {
    const { Customer } = await connectTodb();

    const fetchedData = await Customer.findAll({ where: { joined_by: req.params.refferalCode } });

    if (!fetchedData || fetchedData.length === 0) {
      return res.status(400).json("no data available");
    }

    return res.status(200).json({ data: fetchedData });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};
module.exports = { getDetailsByRole, getDetailsOfJMAandCustomers, getCustomersDetails };
