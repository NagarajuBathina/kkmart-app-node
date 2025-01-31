const connectTodb = require("../misc/db");

// create customer
const createCustomer = async (req, res) => {
  try {
    const { Customer } = await connectTodb();
    let { phone, adhaar } = req.body;
    console.log(req.body);

    const existingAdhaar = await Customer.findOne({ where: { adhaar } });
    if (existingAdhaar) {
      return res.status(400).json({ error: "Customer already exists" });
    }

    const exitstingPhone = await Customer.findOne({ where: { phone } });
    if (exitstingPhone) {
      return res.status(400).json({ error: "Phone number already exists" });
    }

    await Customer.create(req.body);
    return res.status(201).json({ message: "Created successfully" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

// get customer details
const getCustomerDetails = async (req, res) => {
  try {
    const { Customer } = await connectTodb();
    const customerData = await Customer.findOne({ where: { phone: req.params.phone } });
    if (!customerData) {
      return res.status(400).json({ error: "Customer not found" });
    }
    return res.status(200).json(customerData);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

// monthly renewal payment
const customerMonthlyRenewal = async (req, res) => {
  const { sequelize } = await connectTodb();
  const transaction = await sequelize.transaction();
  try {
    const { Customer, Employee, Renewal } = await connectTodb();
    const { joined_by, phone, amount } = req.body;
    let joinedByJMAdata, joinedBySMAdata, joinedByMMAdata;

    const customerData = await Customer.findOne({ where: { phone } });
    if (!customerData) {
      return res.status(400).json({ error: "Customer not found" });
    }

    if (customerData.joined_by != joined_by) {
      return res.status(400).json({ error: "your are not allowed to renew this customer" });
    }

    await Renewal.create(req.body, { transaction });
    try {
      joinedByJMAdata = await getJoinedByData(customerData.joined_by, Employee);
      const jmaEarnings = amount * 0.1;
      await updateData(joinedByJMAdata.id, jmaEarnings, Employee, transaction);
    } catch (error) {
      await transaction.rollback();
      return res.status(400).json({ error: error.message });
    }

    if (joinedByJMAdata.joined_by != "") {
      joinedBySMAdata = await getJoinedByData(joinedByJMAdata.joined_by, Employee);
      if (joinedByJMAdata.position > 8) {
        console.log("JMA position not in range, commission not adding to SMA");
      } else {
        const smaEarnings = amount * 0.05;
        await updateData(joinedBySMAdata.id, smaEarnings, Employee, transaction);
      }
    }

    if (joinedBySMAdata && joinedBySMAdata.joined_by != "") {
      joinedByMMAdata = await getJoinedByData(joinedBySMAdata.joined_by, Employee);
      if (joinedBySMAdata.position > 7) {
        console.log("SMA position not in range, commission not adding to MMA");
      } else {
        const mmaEarnings = amount * 0.02;
        await updateData(joinedByMMAdata.id, mmaEarnings, Employee, transaction);
      }
    }

    await transaction.commit(); // Commit the transaction if all operations succeed
    return res.status(201).json({ message: "Renewal successful" });
  } catch (e) {
    await transaction.rollback(); // Rollback the transaction on any error
    return res.status(500).json({ error: e.message });
  }
};

const getJoinedByData = async (joinedBy, employee) => {
  const checkJoindedBy = await employee.findOne({ where: { refferel_code: joinedBy } });
  if (!checkJoindedBy) {
    throw new Error("Joined by data not found");
  }
  const { ...joinedByDetails } = checkJoindedBy.dataValues;
  return joinedByDetails;
};

const updateData = async (id, amount, employee, transaction) => {
  const checkID = await employee.findOne({ where: { id: id }, transaction });
  if (!checkID) {
    throw new Error("id not found");
  }
  const { ...fetchedDetails } = checkID.dataValues;
  await employee.update(
    { earnings: fetchedDetails.earnings + amount },
    { where: { id: fetchedDetails.id }, transaction }
  );
  return fetchedDetails;
};

module.exports = { createCustomer, getCustomerDetails, customerMonthlyRenewal };
