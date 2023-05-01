const Users = require("../models/Users");

const UpdateUserBalance = async (status, id, newamount) => {
  try {
    if (status === 1) {
      const user = await Users.findOne({ _id: id });
      const res = await user.updateOne(
        { balance: user?.balance + newamount },
        { new: true }
      );
      return res;
    } else if (status === 2) {
      const user = await Users.findOne({ _id: id });
      const res = await user.updateOne(
        { balance: user?.balance - newamount },
        { new: true }
      );
      return res;
    } else {
      return "Sorry Something went wrong";
    }
  } catch (error) {
    return error;
  }
};

module.exports = UpdateUserBalance;
