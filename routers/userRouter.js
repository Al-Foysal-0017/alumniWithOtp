const router = require("express").Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {
  signUp,
  verifyOtp,
  updateProfile,
} = require("../controllers/userController");

router.route("/signup").post(signUp);
router.route("/signup/verify").post(verifyOtp);
router.route("/profile/update").put(isAuthenticatedUser, updateProfile);

module.exports = router;
