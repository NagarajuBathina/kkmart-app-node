const { where } = require("sequelize");
const connectTodb = require("../misc/db");

const withdrawalEarnings = async (req, res) => {
  const { sequelize } = await connectTodb();
  const t = await sequelize.transaction();
  try {
    const { Withdrawal, Employee } = await connectTodb();
    const { phone, amount } = req.body;

    console.log(req.body);

    const checkUser = await Employee.findOne({ where: { phone: phone } });

    if (!checkUser) {
      return res.status(400).json("user not found");
    }

    // Deduct amount only if there are enough earnings
    if (checkUser.earnings < amount) {
      return res.status(400).json("Insufficient earnings");
    }

    // Create a withdrawal and update earnings within the transaction
    await Withdrawal.create(req.body, { transaction: t });

    await Employee.update({ earnings: checkUser.earnings - amount }, { where: { phone: phone }, transaction: t });

    await t.commit();
    return res.status(200).json({ statusCode: 200, message: "Withdrawal successful" });
  } catch (e) {
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

module.exports = { withdrawalEarnings, getWithdrawls };
