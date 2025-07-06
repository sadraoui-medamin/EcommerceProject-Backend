import express from "express";
 import {getSummaryCardStats , getAreaChartStats ,getTableStats , getPieChartsStats } from "../controllers/dashboardController.js";
const router = express.Router();


// Route
router.get("/getSummaryCardStats", getSummaryCardStats);
router.get("/getAreaChartStats", getAreaChartStats);
router.get("/getTableStats", getTableStats);
router.get("/getPiechartStats", getPieChartsStats);


export default router;
