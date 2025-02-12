const { where, Op } = require("sequelize");
const connectTodb = require("../misc/db");

const getMMAlist = async (req, res) => {
  try {
    const { Employee } = await connectTodb();

    const fetchedData = await Employee.findAll({
      where: {
        [Op.and]: [
          { [Op.or]: [{ role: "mma" }, { role: "smh" }, { role: "zmh" }, { role: "dmh" }] },
          { joined_by: req.params.refferalCode },
        ],
      },
    });
    return res.status(200).json({ data: fetchedData });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};

module.exports = { getMMAlist };
