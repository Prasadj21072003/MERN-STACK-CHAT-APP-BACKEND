import express from "express";
import Verify from "../Verify.js";
import {
  getmsg,
  getuserforsidebar,
  sendmsg,
  makegroup,
  sendgroupmsg,
  getgroupmsg,
  clearallmsg,
} from "../controllers/msgcontroller.js";

const router = express.Router();

router.get("/conversations", Verify, getuserforsidebar);
router.post("/sendmsg/:id", Verify, sendmsg);
router.get("/:id", Verify, getmsg);
router.post("/group", Verify, makegroup);
router.get("/group/:id", Verify, getgroupmsg);
router.post("/sendgroupmsg", Verify, sendgroupmsg);
router.delete("/clearallmsg/:id", clearallmsg);

export default router;
