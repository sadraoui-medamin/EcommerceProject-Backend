import express from "express";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";

const router = express.Router();

// Dashboard Controller Function
const getDashboardStats = async (req, res) => {
  try {
    const {
      rangeSalesStats = "today",
      rangeOrderStats = "today",
      rangeCustomerStats = "today",
    } = req.query;

    // 1-Create filters of sales in the currntly and  previous ranges
    //the currentRangeSalesStats &  previousRangeSalesStats of the rangeSalesStats
    const currentRangeSalesStats= getDateRange(rangeSalesStats);
    const previousRangeSalesStats = getDateRange(rangeSalesStats, true);
    const orderFilter = rangeSalesStats !== "all" ?  { 
      payementDate: { 
            $gte: currentRangeSalesStats.start.toISOString(), 
            $lte: currentRangeSalesStats.end.toISOString()
          },
          payment: true
      } : {};
    const prevOrderFilter = rangeSalesStats !== "all" ? { 
      payementDate: { 
        $gte: previousRangeSalesStats.start.toISOString(),
        $lte: previousRangeSalesStats.end.toISOString()
      },
      payment: true 
    } : {};
    const [currentSales, previousSales] = await Promise.all([
      Order.aggregate([
        { $match: orderFilter },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Order.aggregate([
        { $match: prevOrderFilter },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ])
    ]);

    // 2-Count orders in the currntly and  previous ranges
    //the currentRangeOrderStats &  previousRangeOrderStats of the rangeOrderStats
    const currentRangeOrderStats= getDateRange(rangeOrderStats);
    const previousRangeOrderStats = getDateRange(rangeOrderStats, true);
    const [currentOrdersCount, previousOrdersCount] = await Promise.all([
      Order.countDocuments(
                  rangeOrderStats !== "all"
                      ? { date: { $gte: currentRangeOrderStats.start, $lte: currentRangeOrderStats.end } }
                      : {}
                    ),
      Order.countDocuments( 
                  rangeOrderStats !== "all"
                    ? { date: { $gte: previousRangeOrderStats.start, $lte: previousRangeOrderStats.end } }
                    : {}
                  ),
    ]);

    // 3-Count Costumers in the currntly and  previous ranges
    //the currentRangeCustomerStats &  previousRangeCustomerStats of the rangeCustomerStats
    const currentRangeCustomerStats= getDateRange(rangeCustomerStats);
    const previousRangeCustomerStats = getDateRange(rangeCustomerStats, true);
    const [currentUsers, previousUsers] = await Promise.all([
      User.countDocuments(
                  rangeCustomerStats !== "all"
                      ? {  createdAt: { $gte: currentRangeCustomerStats.start, $lte: currentRangeCustomerStats.end } }
                      : {}
                    ),
      User.countDocuments( 
                  rangeCustomerStats !== "all"
                    ? { createdAt: { $gte: previousRangeCustomerStats.start, $lte: previousRangeCustomerStats.end } }
                    : {}
                  ),
    ]);


    const currentSalesValue = currentSales[0]?.total || 0;
    const previousSalesValue = previousSales[0]?.total || 0;

 

    //4-this function get the recently 10 orders 
    const recentlyorders = await Order.find().sort({ date: -1 }).limit(10);
    const recentlyUsers = await User.find().sort({ createdAt: -1 }).limit(10);

    //5-this function return the top 5 seling product and her count of selling 
    // Aggregation to Get Top 5 Selling Products
    const topSellingProducts = await Order.aggregate([
      {
        $match: { payment: true } // Only paid orders
      },
      {
        $unwind: "$items" // Deconstruct the items array
      },
      {
        $group: {
          _id: "$items._id", // Group by product ID
          name: { $first: "$items.name" }, // Optional: capture the name
          images: { $first: "$items.images" }, // Optional: capture the images
          price: { $first: "$items.price" }, // Optional: capture the price
          
          totalSold: { $sum: "$items.quantity" } // Sum quantities sold
        }
      },
      {
        $sort: { totalSold: -1 } // Sort by most sold
      },
      {
        $limit: 5 // Top 5
      }
    ]);

    // this function return array of the  revenus   of the months of the last 12 MONTH , for each month the some of  her revenus 
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1); // Start from the beginning of the month
    const revenueData = await Order.aggregate([
      {
        $match: {
          payment: true,
          payementDate: { $exists: true },
        },
      },
      {
        $addFields: {
          paymentDateConverted: {
            $toDate: "$payementDate",
          },
        },
      },
      {
        $match: {
          paymentDateConverted: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$paymentDateConverted" },
            month: { $month: "$paymentDateConverted" },
          },
          totalRevenue: { $sum: "$amount" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);
    // Create an array of 12 months with 0 revenue by default
    const resultrevenueData = [];
    const now = new Date();
    for (let i = 1; i <= 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
  
      const found = revenueData.find((item) => item._id.year === year && item._id.month === month);
      resultrevenueData.push({
        month: `${year}-${month.toString().padStart(2, "0")}`,
        totalRevenue: found ? found.totalRevenue : 0,
      });
    }
    //topFavoriteproduct  this function return top 10 User.favoritesProducts its array of id of product how's have in favorite u return an array have top 10 product in the usersfavoritesProducts counte
    let  topFavoriteProducts = [];
    try {
      const favorites = await User.aggregate([
        { $unwind: "$favoritesProducts" }, // flatten the array
        { $group: {
            _id: "$favoritesProducts", // group by productId
            count: { $sum: 1 }         // count appearances
          }
        },
        { $sort: { count: -1 } },      // sort descending
        { $limit: 10 }                 // top 10
      ]);
  
      // Populate product data from Product collection
      const topFavorites = await Product.find({
        _id: { $in: favorites.map(fav => fav._id) }
      }).lean();
  
      // Merge product details with count
      topFavoriteProducts = favorites.map(fav => {
        const product = topFavorites.find(p => p._id.toString() === fav._id.toString());
        return {
          ...product,
          favoriteCount: fav.count
        };
      });
  
    } catch (error) {
      console.error("Top favorite products error:", error);
      res.status(500).json({ message: "Server Error" });
    }
    res.json({
      totalSales: currentSalesValue,
      salesChange: rangeSalesStats !== "all" ? calculatePercentageChange(currentSalesValue, previousSalesValue) : null,
      totalOrders: currentOrdersCount,
      ordersChange: rangeOrderStats !== "all" ? calculatePercentageChange(currentOrdersCount, previousOrdersCount) : null,
      totalUsers: currentUsers,
      usersChange: rangeCustomerStats !== "all" ? calculatePercentageChange(currentUsers, previousUsers) : null,
      recentOrders: recentlyorders,
      recentCustomers: recentlyUsers,
      topSellingItems: topSellingProducts,
      YearlyRevenu: resultrevenueData,
      topFavoriteProducts
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getDateRange = (range, previous = false) => {
  const now = new Date();
  const start = new Date();
  const end = new Date();

  // Force all dates to UTC to match database format
  const toUTC = (date) => new Date(date.toISOString().replace('Z', '+00:00'));

  switch (range) {
    case "today":
      if (previous) {
        start.setDate(now.getDate() - 1);
      }
      start.setUTCHours(0, 0, 0, 0);
      end.setUTCDate(start.getUTCDate());
      end.setUTCHours(23, 59, 59, 999);
      break;

    case "week":
      const day = now.getUTCDay();
      const diff = now.getUTCDate() - day + (previous ? -7 : 0);
      start.setUTCDate(diff);
      start.setUTCHours(0, 0, 0, 0);
      end.setUTCDate(start.getUTCDate() + 6);
      end.setUTCHours(23, 59, 59, 999);
      break;

    case "month":
      if (previous) {
        start.setUTCMonth(now.getUTCMonth() - 1);
      }
      start.setUTCDate(1);
      start.setUTCHours(0, 0, 0, 0);
      end.setUTCMonth(start.getUTCMonth() + 1);
      end.setUTCDate(0); // Last day of month
      end.setUTCHours(23, 59, 59, 999);
      break;

    case "year":
      if (previous) {
        start.setUTCFullYear(now.getUTCFullYear() - 1);
      }
      start.setUTCMonth(0, 1);
      start.setUTCHours(0, 0, 0, 0);
      end.setUTCFullYear(start.getUTCFullYear(), 11, 31);
      end.setUTCHours(23, 59, 59, 999);
      break;

    default:
      return null;
  }

  return { 
    start: toUTC(start), 
    end: toUTC(end) 
  };
};


const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
};

// Route
router.get("/stats", getDashboardStats);


export default router;
