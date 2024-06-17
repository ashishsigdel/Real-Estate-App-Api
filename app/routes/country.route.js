import express from "express";
const router = express.Router();
import * as countryController from "../controllers/country.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

router.post("/create", authMiddleware, countryController.createCountry);

router.get("/", countryController.allCountry);

router.get("/:id", countryController.getCountry);

router.post("/update/:id", authMiddleware, countryController.updateCountry);

router.delete("/delete/:id", authMiddleware, countryController.deleteCountry);

export default router;
