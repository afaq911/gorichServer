const Notifications = require("../models/Notifications");
const { VerifyToken } = require("./VerifyToken");
const router = require("express").Router();

// -------------------------- Create Notifications --------------------------------------

router.post("/", VerifyToken, async (req, res) => {
  try {
    const newNotification = new Notifications(req.body);
    const savedNotification = await newNotification.save();
    res.status(200).json(savedNotification);
  } catch (error) {
    res.status(500).json(error);
  }
});

// -------------------------- Read All Notifications --------------------------------------

router.put("/read/:id", VerifyToken, async (req, res) => {
  try {
    const readNotify = await Notifications.updateMany(
      { read: { $nin: req.params.id } },
      {
        $push: { read: req.params.id },
      },
      { new: true }
    );
    res.status(200).json(readNotify);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// -------------------------- Delete Notification --------------------------------------

router.post("/delete/:id", VerifyToken, async (req, res) => {
  try {
    await Notifications.findByIdAndUpdate(req.params.id, {
      $push: { delete: req.body.userId },
    });
    res.status(200).json("Notification Deleted");
  } catch (error) {
    res.status(500).json(error);
  }
});

// ------------------ Get Users Notifications --------------------------------

router.get("/user/all/:id", VerifyToken, async (req, res) => {
  try {
    const allNotifications = await Notifications.find({
      delete: { $nin: req.params.id },
      reciever: { $in: req.params.id },
      toAdmin: false,
    }).sort({ _id: -1 });
    res.status(200).json(allNotifications);
  } catch (error) {
    res.status(500).json(error);
  }
});

// ------------------ Get Admins Notifications --------------------------------

router.get("/admin/all/:id", VerifyToken, async (req, res) => {
  try {
    const allNotifications = await Notifications.find({
      delete: { $nin: req.params.id },
      toAdmin: true,
    }).sort({ _id: -1 });
    res.status(200).json(allNotifications);
  } catch (error) {
    res.status(500).json(error);
  }
});

// ------------------------ UnRead Notifications Count -----------------------------

router.get("/unread", VerifyToken, async (req, res) => {
  let qAdmin = req.query.admin;
  let qUser = req.query.user;

  try {
    let notififcationsCount;

    if (qAdmin) {
      notififcationsCount = await Notifications.count({
        toAdmin: true,
        delete: { $nin: qAdmin },
        read: { $nin: qAdmin },
      });
    } else if (qUser) {
      notififcationsCount = await Notifications.count({
        toAdmin: false,
        reciever: { $in: qUser },
        delete: { $nin: qUser },
        read: { $nin: qUser },
      });
    } else {
      notififcationsCount = 0;
    }

    res.status(200).json(notififcationsCount);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
