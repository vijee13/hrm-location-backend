import express from "express";
import { setOfficeLocation, getOfficeLocation } from "../controllers/locationController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, isAdmin, setOfficeLocation);
router.get("/", verifyToken, getOfficeLocation);

export default router;
