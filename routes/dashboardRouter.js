import express from "express";
 import {getSummaryCardStats , getLineChartStats ,getTableStats , getPieChartsStats } from "../controllers/dashboardController.js";
const router = express.Router();


// Route
router.get("/getSummaryCardStats", getSummaryCardStats);
router.get("/getLineChartStats", getLineChartStats);
router.get("/getTableStats", getTableStats);
router.get("/getPiechartStats", getPieChartsStats);


export default router;
