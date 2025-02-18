const { Op } = require("sequelize");
const connectTodb = require("../misc/db");

const getDetailsByRole = async (req, res) => {
  try {
    const { Employee } = await connectTodb();
    const { refferalCode, role } = req.body;
    let fetchedData;

    if (role != "sma" || role != "jma") {
      fetchedData = await Employee.findAll({
        where: {
          [Op.and]: [
            { [Op.or]: [{ role: "mma" }, { role: "smh" }, { role: "zmh" }, { role: "dmh" }] },
            { joined_by: refferalCode },
          ],
        },
      });
    } else {
      fetchedData = await Employee.findAll({ where: { joined_by: refferalCode, role: role } });
    }

    if (!fetchedData || fetchedData.length === 0) {
      return res.status(400).json({ error: "no data available" });
    }

    return res.status(200).json({ data: fetchedData });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};

const getAllCategoryDetailsById = async (req, res) => {
  try {
    const { Employee, Customer } = await connectTodb();

    let allMMAandAboveRolesData = [];
    let allSMAdata = [];
    let allJMAdata = [];
    let allCustomerData = [];
    let smaList = [];
    let jmaList = [];
    let allMMAlist = [];

    // Get MMA list
    const mmaList = await Employee.findAll({
      where: {
        [Op.and]: [
          { [Op.or]: [{ role: "mma" }, { role: "smh" }, { role: "zmh" }, { role: "dmh" }] },
          { joined_by: req.params.refferalCode },
        ],
      },
    });

    // Store MMA data if available
    if (mmaList && mmaList.length > 0) {
      allMMAandAboveRolesData = [...mmaList];
    } else {
      return res.status(400).json({ error: "no data found" });
    }
    console.log(allMMAandAboveRolesData[0].refferel_code);

    // for(let i=0 ; i<allMMAandAboveRolesData.length ; i++){
    //   allMMAlist = [...allMMAandAboveRolesData[i].refferel_code]
    // }

    // Get unique SMAs using Set
    const smaSet = new Set();
    // If MMA list exists, get their SMAs
    if (mmaList && mmaList.length > 0) {
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
      }
    } else {
      // If no MMAs, try to get SMAs directly
      const directSmaList = await Employee.findAll({
        where: {
          role: "sma",
          joined_by: req.params.refferalCode,
        },
      });
      directSmaList.forEach((sma) => smaSet.add(JSON.stringify(sma)));
    }
    allSMAdata = Array.from(smaSet).map((sma) => JSON.parse(sma));

    // Get JMAs for all SMAs if SMAs exist
    if (allSMAdata.length > 0) {
      for (const sma of allSMAdata) {
        jmaList = await Employee.findAll({ where: { joined_by: sma.refferel_code, role: "jma" } });
        allJMAdata = [...allJMAdata, ...jmaList];
      }
    }

    // Get customers for all JMAs if JMAs exist
    if (allJMAdata.length > 0) {
      for (const jma of allJMAdata) {
        const customerList = await Customer.findAll({
          where: { joined_by: jma.refferel_code },
        });
        allCustomerData = [...allCustomerData, ...customerList];
      }
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
      res.status(400).json({ error: "No JMA data found" });
    }
    let allCustomerData = [];

    for (const jma of jmaList) {
      const customerList = await Customer.findAll({ where: { joined_by: jma.dataValues.refferel_code } });
      allCustomerData = [...allCustomerData, ...customerList];
    }
    if (allCustomerData.length === 0) {
      return res.status(400).json({ error: "No customer data available" });
    }
    res.status(200).json({ data: { customerdata: allCustomerData, jmadata: jmaList } });
  } catch (e) {
    // res.status(500).json({ error: e.message });
    console.log(e);
  }
};

const getCustomersDetails = async (req, res) => {
  try {
    const { Customer } = await connectTodb();

    const fetchedData = await Customer.findAll({ where: { joined_by: req.params.refferalCode } });

    if (!fetchedData || fetchedData.length === 0) {
      return res.status(400).json({ errror: "no data available" });
    }

    return res.status(200).json({ data: fetchedData });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

module.exports = {
  getDetailsByRole,
  getAllCategoryDetailsById,
  getCustomersDetails,
  getCustomersDetailsBySMArole,
};
