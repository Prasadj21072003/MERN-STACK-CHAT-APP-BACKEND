import express from "express";
import {
  getme,
  login,
  logout,
  signup,
  get,
} from "../controllers/authcontroller.js";

import Verify from "../Verify.js";

const router = express.Router();

router.post("/me", Verify, getme);
router.post("/login", login);
router.post("/logout", logout);
router.post("/signup", signup);

export default router;
