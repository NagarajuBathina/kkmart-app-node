const { where, Op } = require("sequelize");
const connectTodb = require("../misc/db");

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
        return referrals;
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

// get level list
const getMMAlist = async (req, res) => {
  try {
    const { Employee } = await connectTodb();
    let levelData = {};
    let refferelCodes = [];

    // Function to fetch referrals recursively
    const fetchAllReferrals = async (referralCode, currentLevel) => {
      const referrals = await Employee.findAll({
        where: {
          [Op.and]: [
            { [Op.or]: [{ role: "mma" }, { role: "smh" }, { role: "zmh" }, { role: "dmh" }] },
            { joined_by: referralCode },
          ],
        },
      });

      // Store the level data
      if (referrals.length > 0) {
        refferelCodes.push(...referrals.map((ref) => ref.refferel_code));

        // Store the level information
        levelData[`level${currentLevel}`] = {
          level: currentLevel,
          length: referrals.length,
        };

        // Recursively fetch referrals for the new referral codes
        for (const code of referrals.map((ref) => ref.refferel_code)) {
          await fetchAllReferrals(code, currentLevel + 1);
        }
      }
    };

    // Start fetching referrals from the initial referral code
    await fetchAllReferrals(req.params.refferalCode, 1);

    return res.status(200).json({ data: { ...levelData } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};

module.exports = { getMMAlist, getMMAlevelsList };
