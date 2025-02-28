const { where } = require("sequelize");
const connectTodb = require("../misc/db");

const withdrawalEarnings = async (req, res) => {
  const { sequelize } = await connectTodb();
  const t = await sequelize.transaction();
  try {
    const { Withdrawal, Employee, EmployeeBankDetails } = await connectTodb();
    const { phone, amount } = req.body;

    const checkBankDetails = await EmployeeBankDetails.findOne({ where: { phone: phone } });
    if (!checkBankDetails) {
      return res.status(400).json({ message: "Please Update Bank Details To Withdrawl" });
    }

    const checkUser = await Employee.findOne({ where: { phone: phone } });

    // Deduct amount only if there are enough earnings
    if (checkUser.earnings < amount) {
      return res.status(400).json({ message: "Insufficient earnings" });
    }

    req.body.ac_no = checkBankDetails.bank_ac_no;
    req.body.ifsc_code = checkBankDetails.ifsc_code;

    // Create a withdrawal and update earnings within the transaction
    await Withdrawal.create(req.body, { transaction: t });

    await Employee.update({ earnings: checkUser.earnings - amount }, { where: { phone: phone }, transaction: t });

    await t.commit();
    return res.status(200).json({ statusCode: 200, message: "Withdrawal successful" });
  } catch (e) {
    console.log(e);
    await t.rollback();
    return res.status(500).json({ error: e.message });
  }
};

const getWithdrawls = async (req, res) => {
  try {
    const { Withdrawal } = await connectTodb();

    const getAllWithdrawlDetails = await Withdrawal.findAll({
      where: { phone: req.params.phone },
      order: [["addedon", "DESC"]],
    });
    if (!getAllWithdrawlDetails) {
      return res.status(400).json("No data found");
    }
    return res.status(200).json({ data: getAllWithdrawlDetails });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const updateWithdrawlStatus = async (req, res) => {
  try {
    const { Withdrawal } = await connectTodb();
    const { slno, status } = req.body;

    // Ensure that slno is provided
    if (!slno) {
      return res.status(400).json({ error: "Withdrawal ID is required" });
    }

    // Update the withdrawal status
    const [updated] = await Withdrawal.update({ status }, { where: { slno } });

    if (updated === 0) {
      return res.status(404).json({ error: "Withdrawal not found" });
    }

    return res.status(200).json({ message: "Withdrawal status updated successfully" });
  } catch (error) {
    console.error("Error updating withdrawal status:", error);
    return res.status(500).json({ error: error.message });
  }
};
module.exports = { withdrawalEarnings, getWithdrawls, updateWithdrawlStatus };
