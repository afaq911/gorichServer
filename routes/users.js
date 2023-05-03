const Users = require("../models/Users");
const {
  VerifyToken,
  VerifyTokenAndAuth,
  VerifyTokenAndAdmin,
} = require("./VerifyToken");
const router = require("express").Router();
const CryptoJs = require("crypto-js");

// ------------------------------------- Get All Users Here ---------------------------------

router.get("/", async (req, res) => {
  try {
    const users = await Users.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get Single Users Here ---------------------------------------------------------------------

router.get("/single/:id", VerifyToken, async (req, res) => {
  try {
    const user = await Users.findById(req.params.id);

    if (user?.isActive) {
      const { password, ...others } = user?._doc;
      res.status(200).json(others);
      return;
    } else {
      res.status(404).json("Account is not active");
      return;
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// ------------------------------------------------- Update User ------------------------

router.put("/:id", VerifyTokenAndAuth, async (req, res) => {
  if (req.body.password) {
    req.body.password = CryptoJs.AES.encrypt(
      req.body.password,
      process.env.CRYPTO_SECRET
    ).toString();
  }

  try {
    const data = req.body;

    const isUserEmail = await Users.findOne({ email: data?.email });
    if (isUserEmail) {
      res.status(500).json("Email already registered");
      return;
    }

    const isUserMobileNo = await Users.findOne({ mobileno: data?.mobileno });
    if (isUserMobileNo) {
      res.status(500).json("Phone Number already registered");
      return;
    }

    const updatedUser = await Users.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });

    const { password, ...others } = updatedUser?._doc;
    res.status(200).json({ data: others, message: "Updated Successfully" });
  } catch (error) {
    res.status(500).json(error);
  }
});

// ---------------------------------------- update password ---------------------------------------

router.put("/update/password/:id", async (req, res) => {
  if (req.body.newpassword) {
    req.body.newpassword = CryptoJs.AES.encrypt(
      req.body.newpassword,
      process.env.CRYPTO_SECRET
    ).toString();
  }
  try {
    const data = req.body;
    const user = await Users.findById(req.params.id);
    const DecreptedPassword = CryptoJs.AES.decrypt(
      user?.password,
      process.env.CRYPTO_SECRET
    ).toString(CryptoJs.enc.Utf8);

    if (DecreptedPassword !== data?.password) {
      res.status(404).json("Wrong Present Password");
      return;
    } else {
      await user.updateOne({ password: data?.newpassword });
      res.status(200).json("Password updated successfully");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// ---------------------------- Activate or Deactivate a user ----------------

router.post("/actions/:id", VerifyTokenAndAdmin, async (req, res) => {
  try {
    const user = await Users.findOne({ _id: req.params.id });
    if (user.isActive === true) {
      await user.updateOne({ isActive: false });
      res.status(200).json("User Deactivated");
      return;
    } else {
      await user.updateOne({ isActive: true });
      res.status(200).json("User Activated");
      return;
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
