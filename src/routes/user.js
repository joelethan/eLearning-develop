import { Router } from "express";
import { healthCheck } from "../controllers/healthCheck";
import {
  checkPrivilege,
  confirmEmail,
  linkedInLogin,
  login,
  registerUser,
  resetPassword,
  resetPasswordConfirm,
  searchUser,
  getProfile,
  updatePassword,
  updateProfile,
  getActivity,
  googleLogin,
  facebookLogin,
  LoginRefreshToken,
} from "../controllers/user";
import { linkedInMiddleware } from "../middlewares/linkedinMiddleware";
import { isLoggedIn } from "../middlewares/isLoggedIn";
import { jwtLogin } from "../middlewares/jwtLogin";

const router = Router();

// Test endpoint
router.get("/", healthCheck);

// Register User
router.post("/register", registerUser);

// Verify User account
router.get("/confirmation/:emailToken", confirmEmail);

// Login User
router.post("/login", login);

// refreshtoken for User
router.post("/refreshtoken", LoginRefreshToken);

// User Search
router.get("/search", searchUser);

// get user privilege
router.get("/privilege/:id", checkPrivilege);

// get user profile
router.get("/profile", jwtLogin(), getProfile);

// Update profile
router.put("/profile", jwtLogin(), updateProfile);

// Change password
router.put("/password", jwtLogin(), updatePassword);

// Forgot password
router.get("/forgotpassword", resetPassword);

// Reset password
router.put("/passwordreset/:resetToken", resetPasswordConfirm);

router.get("/activity", jwtLogin(), getActivity);

// google login
router.post("/google", isLoggedIn("google-plus-token"), googleLogin);

// facebook login
router.post("/facebook", isLoggedIn("facebook-token"), facebookLogin);

// linkedIn login
router.get("/linkedin", linkedInMiddleware, linkedInLogin);

export default router;
