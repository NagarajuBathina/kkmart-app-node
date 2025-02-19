const { where } = require("sequelize");
const fs = require("fs").promises;
const connectTodb = require("../misc/db");

//validate before creating customer
const validateBeforeCreatingCustomer = async (req, res) => {
  try {
    const { Customer } = await connectTodb();
    const { phone, adhaar, smart_card_number } = req.body;
    const exitstingPhone = await Customer.findOne({ where: { phone } });
    if (exitstingPhone) {
      return res.status(400).json({ error: "Phone number already exists" });
    }

    const exitstingAdhaar = await Customer.findOne({ where: { adhaar } });
    if (exitstingAdhaar) {
      return res.status(400).json({ error: "Adhaar number already exists" });
    }

    const exitstingSmartCard = await Customer.findOne({ where: { smart_card_number } });
    if (exitstingSmartCard) {
      return res.status(400).json({ error: "Smart card already exists" });
    }
    return res.status(200).json({ success: true });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: e.message });
  }
};

// create customer
const createCustomer = async (req, res) => {
  const { sequelize, Customer, Renewal, Employee } = await connectTodb();
  const transaction = await sequelize.transaction();
  try {
    let { joined_by } = req.body;

    // Create customer
    await Customer.create(req.body, { transaction });

    // Create renewal record
    await Renewal.create(req.body, { transaction });

    // Process earnings distribution
    try {
      await processEarnings(joined_by, Employee, transaction);
    } catch (error) {
      await transaction.rollback();
      return res.status(400).json({ error: error.message });
    }

    await transaction.commit();
    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
    });
  } catch (e) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    return res.status(500).json({ error: e.message });
  }
};

// Helper function to process earnings
const processEarnings = async (joined_by, employee, transaction) => {
  const joinedByJMAdata = await fetchJoinedByData(joined_by, employee);
  const jmaEarnings = 50;

  await updateData(joinedByJMAdata.phone, jmaEarnings, employee, transaction);
  await employee.update(
    { customer_count: joinedByJMAdata.customer_count + 1 },
    { where: { phone: joinedByJMAdata.phone }, transaction }
  );

  const joinedBySMAdata = await fetchJoinedByData(joinedByJMAdata.joined_by, employee);
  if (joinedByJMAdata.position <= 8) {
    const smaEarnings = 20;

    await updateData(joinedBySMAdata.phone, smaEarnings, employee, transaction);
    await employee.update(
      { customer_count: joinedBySMAdata.customer_count + 1 },
      { where: { phone: joinedBySMAdata.phone }, transaction }
    );
  }

  const joinedByMMAdata = await fetchJoinedByData(joinedBySMAdata.joined_by, employee);
  try {
    if (joinedBySMAdata.position <= 7 && joinedByMMAdata.mma_count === 0) {
      const mmaEarnings = 10;

      await updateData(joinedByMMAdata.phone, mmaEarnings, employee, transaction);
      await employee.update(
        { customer_count: joinedByMMAdata.customer_count + 1 },
        { where: { phone: joinedByMMAdata.phone }, transaction }
      );
    } else if (joinedBySMAdata.position <= 7 && joinedByMMAdata.mma_count > 0) {
      const mmaEarnings = 5;

      await updateData(joinedByMMAdata.phone, mmaEarnings, employee, transaction);
      await employee.update(
        { customer_count: joinedByMMAdata.customer_count + 1 },
        { where: { phone: joinedByMMAdata.phone }, transaction }
      );
    }
  } catch (error) {
    console.error("Error updating earnings:", error);
    await transaction.rollback();
    throw error;
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
    const { joined_by, phone } = req.body;
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
      joinedByJMAdata = await fetchJoinedByData(customerData.joined_by, Employee);
      const jmaEarnings = 27.5;
      await updateData(joinedByJMAdata.phone, jmaEarnings, Employee, transaction);
    } catch (error) {
      await transaction.rollback();
      return res.status(400).json({ error: error.message });
    }

    joinedBySMAdata = await fetchJoinedByData(joinedByJMAdata.joined_by, Employee);
    if (joinedByJMAdata.position > 8) {
      console.log("JMA position not in range, commission not adding to SMA");
    } else {
      const smaEarnings = 10;
      await updateData(joinedBySMAdata.phone, smaEarnings, Employee, transaction);
    }

    joinedByMMAdata = await fetchJoinedByData(joinedBySMAdata.joined_by, Employee);
    if (joinedBySMAdata.position <= 7) {
      let mmaEarnings;
      switch (joinedByMMAdata.role) {
        case "mma":
          mmaEarnings = 6;
          break;
        case "dmh":
          mmaEarnings = 1.75;
          break;
        case "zmh":
          mmaEarnings = 1.3;
          break;
        case "smh":
          mmaEarnings = 1;
          break;
        default:
          mmaEarnings = 0;
      }
      await updateData(joinedByMMAdata.phone, mmaEarnings, Employee, transaction);
    } else {
      console.log("SMA position not in range, commission not adding to MMA");
    }

    await transaction.commit(); // Commit the transaction if all operations succeed
    return res.status(201).json({ message: "Renewal successful" });
  } catch (e) {
    await transaction.rollback(); // Rollback the transaction on any error
    return res.status(500).json({ error: e.message });
  }
};

const fetchJoinedByData = async (joinedBy, employee) => {
  const checkJoindedBy = await employee.findOne({ where: { refferel_code: joinedBy } });
  if (!checkJoindedBy) {
    throw new Error("Joined by data not found");
  }
  const { ...joinedByDetails } = checkJoindedBy.dataValues;
  return joinedByDetails;
};

const updateData = async (phone, amount, employee, transaction) => {
  try {
    const checkUser = await employee.findOne({ where: { phone: phone }, transaction });
    if (!checkUser) {
      throw new Error("ID not found");
    }

    // Ensure earnings is treated as a number
    const earnings = parseFloat(checkUser.dataValues.earnings) || 0;
    console.log(earnings);
    const newEarnings = earnings + parseFloat(amount);
    console.log(newEarnings);

    const currentDate = new Date();
    console.log(currentDate.toDateString());
    const existingDate = new Date(checkUser.dataValues.date);
    console.log(existingDate.toDateString());

    if (existingDate.toDateString() !== currentDate.toDateString()) {
      // Update daily earnings with the amount and set the date to current date
      await employee.update(
        {
          earnings: newEarnings,
          daily_earnings: amount,
          date: currentDate,
        },
        { where: { id: checkUser.dataValues.id }, transaction }
      );
    } else {
      // Update daily earnings by adding the amount to the existing daily earnings
      const dailyEarnings = parseFloat(checkUser.dataValues.daily_earnings) || 0;
      await employee.update(
        {
          earnings: newEarnings,
          daily_earnings: dailyEarnings + amount,
        },
        { where: { id: checkUser.dataValues.id }, transaction }
      );
    }
  } catch (error) {
    console.error("Error updating data:", error);
    throw error;
  }
};

// upload profile for customer
const uploadProfileforCustomer = async (req, res) => {
  const { Customer } = await connectTodb();
  const { phone } = req.body;

  try {
    const checkUser = await Customer.findOne({ where: { phone: phone } });

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!checkUser) {
      return res.status(400).json({ error: "customer not found" });
    }

    let profileBase64 = null;
    if (req.file) {
      const fileData = await fs.readFile(req.file.path);
      profileBase64 = `data:${req.file.mimetype};base64,${fileData.toString("base64")}`;
      await fs.unlink(req.file.path).catch(console.error);
    }

    if (profileBase64) {
      await Customer.update({ profile: profileBase64 }, { where: { phone: phone } });
      return res.status(200).json({ message: "Profile Updated", data: profileBase64 });
    } else {
      return res.status(400).json({ error: "No file uploaded" });
    }
  } catch (e) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    return res.status(500).json({ error: e.message });
  }
};

// get renewl history
const getRenewalHistory = async (req, res) => {
  try {
    const { Renewal } = await connectTodb();
    const fetchedData = await Renewal.findAll({
      where: { joined_by: req.params.joined_by },
      order: [["addedon", "DESC"]],
    });
    if (!fetchedData || fetchedData.length === 0) {
      return res.status(400).json({ data: "No data found" });
    }
    return res.status(200).json({ data: fetchedData });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

module.exports = {
  createCustomer,
  getCustomerDetails,
  customerMonthlyRenewal,
  validateBeforeCreatingCustomer,
  getRenewalHistory,
  uploadProfileforCustomer,
};
