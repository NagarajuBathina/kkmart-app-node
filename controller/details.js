const { Op } = require("sequelize");
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

    let allMMAandAboveRolesData = [];
    let allSMAdata = [];
    let allJMAdata = [];
    let allCustomerData = [];
    let smaList = [];
    let jmaList = [];
    let customerList = [];
    const mmaList = await Employee.findAll({
      where: {
        [Op.and]: [
          { [Op.or]: [{ role: "mma" }, { role: "smh" }, { role: "zmh" }, { role: "dmh" }] },
          { joined_by: req.params.refferalCode },
        ],
      },
    });

    if (!mmaList || mmaList.length === 0) {
      return res.status(400).json("No MMA data available");
    }
    allMMAandAboveRolesData = [...allMMAandAboveRolesData, ...mmaList];

    const smaSet = new Set();
    for (const mma of mmaList) {
      smaList = await Employee.findAll({
        where: {
          [Op.and]: [
            { role: "sma" },
            {
              [Op.or]: [{ joined_by: mma.dataValues.refferel_code }, { joined_by: req.params.refferalCode }],
            },
          ],
        },
      });
      smaList.forEach((sma) => smaSet.add(JSON.stringify(sma)));

      allSMAdata = Array.from(smaSet).map((sma) => JSON.parse(sma));
    }

    for (const sma of smaList) {
      jmaList = await Employee.findAll({ where: { joined_by: sma.dataValues.refferel_code, role: "jma" } });
      allJMAdata = [...allJMAdata, ...jmaList];
    }

    if (allJMAdata.length === 0) {
      return res.status(400).json("No JMA data available");
    }

    for (const jma of allJMAdata) {
      customerList = await Customer.findAll({ where: { joined_by: jma.dataValues.refferel_code } });
      allCustomerData = [...customerList];
    }

    if (allCustomerData.length === 0) {
      return res.status(400).json("No customer data available");
    }

    return res.status(200).json({
      data: {
        mmaData: allMMAandAboveRolesData,
        smaData: allSMAdata,
        jmaData: allJMAdata,
        customerData: allCustomerData,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const getCustomersDetailsBySMArole = async (req, res) => {
  try {
    const { Employee, Customer } = await connectTodb();
    const jmaList = await Employee.findAll({ where: { joined_by: req.params.refferalCode, role: "jma" } });
    if (jmaList.length === 0 || !jmaList) {
      res.status(400).json("No JMA data found");
    }
    let allCustomerData = [];

    for (const jma of jmaList) {
      const customerList = await Customer.findAll({ where: { joined_by: jma.dataValues.refferel_code } });
      allCustomerData = [...allCustomerData, ...customerList];
    }
    if (allCustomerData.length === 0) {
      return res.status(400).json("No customer data available");
    }
    res.status(200).json({ data: { customerdata: allCustomerData, jmadata: jmaList } });
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
module.exports = { getDetailsByRole, getDetailsOfJMAandCustomers, getCustomersDetails, getCustomersDetailsBySMArole };
