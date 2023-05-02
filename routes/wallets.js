const Wallets = require("../models/Wallets");
const { VerifyTokenAndAdmin, VerifyToken } = require("./VerifyToken");
const router = require("express").Router();

// --------------- Add a new Wallet ------------------------------------

router.post("/", VerifyTokenAndAdmin, async (req, res) => {
  try {
    const newWallet = new Wallets(req.body);
    const savedWallet = await newWallet.save();
    res
      .status(200)
      .json({ data: savedWallet, message: "Wallet saved successfully" });
  } catch (error) {
    res.status(500).json(error);
  }
});

// ---------------- Get All Wallets ------------------------------------

router.get("/all", VerifyToken, async (req, res) => {
  const isActive = req.query.active;
  try {
    let wallets;
    if (isActive) {
      wallets = await Wallets.find({ status: true }).sort({ _id: -1 });
    } else {
      wallets = await Wallets.find().sort({ _id: -1 });
    }
    res.status(200).json(wallets);
  } catch (error) {
    res.status(500).json(error);
  }
});

// ------------------------- Update Status ------------------------

router.put("/status/:id", VerifyTokenAndAdmin, async (req, res) => {
  try {
    const wallet = await Wallets.findById(req.params.id);
    if (wallet.status === true) {
      await wallet.updateOne({ status: false });
    } else {
      await wallet.updateOne({ status: true });
    }
    res.status(200).json("Wallet Updated");
  } catch (error) {
    res.status(500).json(error);
  }
});

// Delete Wallet -------------------------------------

router.delete("/:id", VerifyTokenAndAdmin, async (req, res) => {
  try {
    await Wallets.findByIdAndDelete(req.params.id);
    res.status(200).json("Wallet Deleted");
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
