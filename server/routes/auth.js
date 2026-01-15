const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post("/register", authController.register);

// @route   POST api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", authController.login);

// @route   PUT api/auth/update
// @desc    Update user details
// @access  Private (Needs checking, using body ID for now)
router.put("/update", authController.updateUser);

module.exports = router;
