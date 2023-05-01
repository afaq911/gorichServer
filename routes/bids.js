const { default: mongoose } = require("mongoose");
const Bids = require("../models/Bids");
const { VerifyToken, VerifyTokenAndAdmin } = require("./VerifyToken");
const router = require("express").Router();
const cron = require("node-cron");
const Products = require("../models/Products");
const UpdateUserBalance = require("../utils/UpdateUserBalance");
const Users = require("../models/Users");

// Create a bid by user --------------------------------------
router.post("/apply", VerifyToken, async (req, res) => {
  try {
    const isAlreadyApplied = await Bids.findOne({
      userId: req.body.userId,
      productId: req.body.productId,
      isCompleted: false,
    });

    if (isAlreadyApplied) {
      res.status(404).json("Already applied");
      return;
    }

    const BidProduct = await Products.findOne({ _id: req.body.productId });
    let reduceAmount = Number(BidProduct.price);
    let profitamount = Number(
      (BidProduct?.price * BidProduct?.comession) / 100
    );

    const isBalanceAvailable = await Users.findOne({ _id: req.body.userId });

    if (isBalanceAvailable?.balance < reduceAmount) {
      res.status(500).json("User Does Not Have Enought Balance");
      return;
    }

    await UpdateUserBalance(2, req.body.userId, reduceAmount);
    const newBid = new Bids({ ...req.body, profit: profitamount });
    const savedBid = await newBid.save();
    res
      .status(200)
      .json({ message: "Bid applied successfully", data: savedBid });
  } catch (error) {
    res.status(500).json(error);
  }
});

// All bid of of a product -----------------------------------------

router.get("/products/:id", VerifyTokenAndAdmin, async (req, res) => {
  try {
    const productBids = await Bids.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(req.params.id) } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
    ]).sort({ _id: -1 });
    res.status(200).json(productBids);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// All bid of of a user -----------------------------------------

router.get("/user/:id", VerifyToken, async (req, res) => {
  try {
    const userBids = await Bids.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.params.id) } },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
    ]).sort({ _id: -1 });
    res.status(200).json(userBids);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// Schedule Bids Here ---------------------------------------------------------

cron.schedule("* * * * *", () => {
  CompleteBids();
});

const CompleteBids = async () => {
  try {
    const UncompletedBids = await Bids.find({ isCompleted: false });
    for (let i = 0; i < UncompletedBids.length; i++) {
      let OneUncompletedBid = UncompletedBids[i];
      let today = Date.now();
      let bidExpiresIn = Date.parse(OneUncompletedBid.expiresIn);
      if (today >= bidExpiresIn) {
        let BidProduct = await Products.findOne({
          _id: OneUncompletedBid?.productId,
        });
        let profitamount = Number(
          (BidProduct?.price * BidProduct?.comession) / 100
        );
        let newamount = Number(BidProduct?.price) + profitamount;
        await UpdateUserBalance(1, OneUncompletedBid?.userId, newamount);
        await OneUncompletedBid.updateOne({
          isCompleted: true,
        });
        console.log("Record Updated & Balance Added");
      }
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = router;
