const Payments = require("../models/Payments");
const Users = require("../models/Users");
const UpdateUserBalance = require("../utils/UpdateUserBalance");
const { VerifyToken, VerifyTokenAndAdmin } = require("./VerifyToken");
const router = require("express").Router();

// Deposit From user account --------------------------------------------------------

router.post("/request", VerifyToken, async (req, res) => {
  try {
    const user = await Users.findOne({ _id: req.body.userId });
    if (req.body.type === 2 && user?.balance <= req.body.amount) {
      res.status(404).json("Users Does not have enough balance to withdraw");
      return;
    }

    const newPayment = new Payments(req.body);
    const savedPayment = await newPayment.save();

    res.status(200).json({
      data: savedPayment,
      message: `${
        req.body.type === 1 ? "Deposit" : "Withdraw"
      } Requested Successfully`,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

// Show all pending payments to admin ----------------------------------------------

router.get("/pendings", VerifyToken, async (req, res) => {
  try {
    const payments = await Payments.find({ status: 1 });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Accept payments here -----------------------------------------------------------

router.post("/actions/:id", VerifyTokenAndAdmin, async (req, res) => {
  try {
    if (req.body.action === "accept") {
      const paymentRes = await Payments.findByIdAndUpdate(
        req.params.id,
        { status: 2 },
        { new: true }
      );

      await UpdateUserBalance(
        paymentRes.type,
        paymentRes.userId,
        Number(paymentRes.amount)
      );

      res.status(200).json("Payment Accepted");
    } else if (req.body.action === "reject") {
      await Payments.findByIdAndUpdate(
        req.params.id,
        { status: 3 },
        { new: true }
      );

      res.status(200).json("Payment Rejected");
    } else {
      res.status(404).json("Payment Not Found");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// get all transcations fro admin to check ---------------------------------------

router.get("/transactions", VerifyTokenAndAdmin, async (req, res) => {
  try {
    const transaction = await Payments.aggregate([
      { $match: { status: { $ne: 1 } } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userInfo",
        },
      },
    ]).sort({ _id: -1 });
    res.status(200).json(transaction);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// Get Single users transcations details --------------------------------

router.get("/users/:id", VerifyToken, async (req, res) => {
  try {
    const transactionInfo = await Payments.find({ userId: req.params.id }).sort(
      { _id: -1 }
    );
    res.status(200).json(transactionInfo);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
