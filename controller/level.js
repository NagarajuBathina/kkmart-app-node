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

// get mma level wise list
const getMMAlevelsList = async (req, res) => {
  try {
    const { Employee } = await connectTodb();
    const { levelCount, refferalCode } = req.body;

    const fetchReferrals = async (currentLevel, referralCode) => {
      if (currentLevel > levelCount) {
        return [];
      }

      const referrals = await Employee.findAll({
        where: {
          [Op.and]: [
            { [Op.or]: [{ role: "mma" }, { role: "smh" }, { role: "zmh" }, { role: "dmh" }] },
            { joined_by: referralCode },
          ],
        },
      });

      if (currentLevel === levelCount) {
        return referrals; // Return only the last level's referrals
      }

      let allReferrals = [];
      for (const referral of referrals) {
        const subReferrals = await fetchReferrals(currentLevel + 1, referral.refferel_code);
        allReferrals = [...allReferrals, ...subReferrals];
      }

      return allReferrals;
    };

    const fetchedData = await fetchReferrals(1, refferalCode);

    console.log(fetchedData.length);

    return res.status(200).json({ data: fetchedData });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};
module.exports = { getMMAlist, getMMAlevelsList };
