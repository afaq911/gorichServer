const Payments = require("../models/Payments");
const Users = require("../models/Users");
const UpdateUserBalance = require("../utils/UpdateUserBalance");
const { VerifyToken, VerifyTokenAndAdmin } = require("./VerifyToken");
const router = require("express").Router();

// Deposit From user account --------------------------------------------------------

router.post("/request", VerifyToken, async (req, res) => {
  try {
    const user = await Users.findOne({ _id: req.body.userId });
    if (req.body.type === 2 && user?.balance < req.body.amount) {
      res.status(404).json("Users Does not have enough balance to withdraw");
      return;
    }

    const newPayment = new Payments(req.body);
    const savedPayment = await newPayment.save();

    if (req.body.type === 2) {
      await UpdateUserBalance(
        req.body.type,
        req.body.userId,
        Number(req.body.amount)
      );
    }

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
    const payments = await Payments.find({ status: 1 }).sort({ _id: -1 });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Accept payments here -----------------------------------------------------------
router.post("/actions/:id", VerifyTokenAndAdmin, async (req, res) => {
  try {
    const Payment = await Payments.findById(req.params.id);

    if (req.body.action === "accept") {
      if (Payment?.type === 2) {
        await Payment.updateOne({ status: 2 });
        res.status(200).json({ data: 1, message: "Withdraw Payment Accepted" });
        return;
      } else if (Payment?.type === 1) {
        await Payment.updateOne({ status: 2 });
        await UpdateUserBalance(
          Payment.type,
          Payment.userId,
          Number(Payment.amount)
        );
        res.status(200).json({ data: 2, message: "Deposit Payment Accepted" });
        return;
      }
    } else if (req.body.action === "reject") {
      await Payment.updateOne({ status: 3 });
      if (Payment.type === 2) {
        await UpdateUserBalance(1, Payment.userId, Number(Payment.amount));
      }
      res.status(200).json({ data: 3, message: "Payment Rejected" });
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

// Delete a payment transaction --------------------------------
router.delete("/:id", VerifyTokenAndAdmin, async (req, res) => {
  try {
    await Payments.findByIdAndDelete(req.params.id);
    res.status(200).json("Payment Deleted Successfully");
  } catch (error) {
    res.status(500).json(error);
  }
});

// Undo a Payment Transaction --------------------------------
router.put("/undo/:id", VerifyTokenAndAdmin, async (req, res) => {
  try {
    const paymentRes = await Payments.findByIdAndUpdate(req.params.id, {
      status: 1,
    });

    if (paymentRes?.status === 2 && paymentRes?.type === 1) {
      await UpdateUserBalance(2, paymentRes.userId, Number(paymentRes.amount));
      res.status(200).json("Request Done");
      return;
    } else if (paymentRes?.status === 3 && paymentRes?.type === 2) {
      await UpdateUserBalance(2, paymentRes.userId, Number(paymentRes.amount));
      res.status(200).json("Request Done");
      return;
    } else {
      res.status(200).json("No Request Found");
      return;
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
