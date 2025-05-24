import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";

// 1️⃣. get dashboard stats    
const getSummaryCardStats = async (req, res) => {
  try {       
    const {
        rangeSalesStats = "today",
        rangeOrderStats = "today",
        rangeCustomerStats = "today",
    } = req.query;

    const currentSalesRange = getDateRange(rangeSalesStats);
    const previousSalesRange = getDateRange(rangeSalesStats, true);

    const orderFilter = rangeSalesStats !== "all"
        ? {
            payementDate: {
            $gte: currentSalesRange.start.toISOString(),
            $lte: currentSalesRange.end.toISOString(),
            },
            payment: true,
        }
        : {};

    const prevOrderFilter = rangeSalesStats !== "all"
        ? {
            payementDate: {
            $gte: previousSalesRange.start.toISOString(),
            $lte: previousSalesRange.end.toISOString(),
            },
            payment: true,
        }
        : {};

    const [currentSales, previousSales] = await Promise.all([
        Order.aggregate([{ $match: orderFilter }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
        Order.aggregate([{ $match: prevOrderFilter }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    ]);

    const currentOrderRange = getDateRange(rangeOrderStats);
    const previousOrderRange = getDateRange(rangeOrderStats, true);

    const [currentOrdersCount, previousOrdersCount] = await Promise.all([
        Order.countDocuments(rangeOrderStats !== "all" ? {
        date: { $gte: currentOrderRange.start, $lte: currentOrderRange.end },
        } : {}),
        Order.countDocuments(rangeOrderStats !== "all" ? {
        date: { $gte: previousOrderRange.start, $lte: previousOrderRange.end },
        } : {}),
    ]);

    const currentCustomerRange = getDateRange(rangeCustomerStats);
    const previousCustomerRange = getDateRange(rangeCustomerStats, true);

    const [currentUsers, previousUsers] = await Promise.all([
        User.countDocuments(rangeCustomerStats !== "all" ? {
        createdAt: { $gte: currentCustomerRange.start, $lte: currentCustomerRange.end },
        } : {}),
        User.countDocuments(rangeCustomerStats !== "all" ? {
        createdAt: { $gte: previousCustomerRange.start, $lte: previousCustomerRange.end },
        } : {}),
    ]);

    const currentSalesValue = currentSales[0]?.total || 0;
    const previousSalesValue = previousSales[0]?.total || 0;

    res.status(200).json({
        totalSales: currentSalesValue,
        salesChange: rangeSalesStats !== "all" ? calculatePercentageChange(currentSalesValue, previousSalesValue) : null,
        totalOrders: currentOrdersCount,
        ordersChange: rangeOrderStats !== "all" ? calculatePercentageChange(currentOrdersCount, previousOrdersCount) : null,
        totalUsers: currentUsers,
        usersChange: rangeCustomerStats !== "all" ? calculatePercentageChange(currentUsers, previousUsers) : null,
    });
  } catch (error) {
        console.error("Error in getSummaryCardStats stats   :", error);
        res.status(500).json({ message: "Failed to  getSummaryCardStats stats." });
  }
};

// 2️⃣. get LineChart Stats
const getLineChartStats = async (req, res) => {
  try {  
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);

    const revenueData = await Order.aggregate([
        { $match: { payment: true, payementDate: { $exists: true } } },
        { $addFields: { paymentDateConverted: { $toDate: "$payementDate" } } },
        { $match: { paymentDateConverted: { $gte: twelveMonthsAgo } } },
        {
        $group: {
            _id: {
            year: { $year: "$paymentDateConverted" },
            month: { $month: "$paymentDateConverted" },
            },
            totalRevenue: { $sum: "$amount" },
        },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const data = [];
    const now = new Date();

    for (let i = 1; i <= 12; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        const found = revenueData.find((item) => item._id.year === year && item._id.month === month);
        data.push({
        month: `${year}-${month.toString().padStart(2, "0")}`,
        totalRevenue: found ? found.totalRevenue : 0,
        });
    }
    res.status(200).json({
        resultrevenueData :data
        });
 } catch (error) {
        console.error("Error in LineChart stats   :", error);
        res.status(500).json({ message: "Failed to get LineChartt stats." });
  }
};

// 3️⃣. getTableStats
const getTableStats = async (req, res) => {
try { 
    const recentOrders = await Order.find().sort({ date: -1 }).limit(10);
    const recentCustomers = await User.find().sort({ createdAt: -1 }).limit(10);

    const topSellingItems = await Order.aggregate([
    { $match: { payment: true } },
    { $unwind: "$items" },
    {
        $group: {
        _id: "$items._id",
        name: { $first: "$items.name" },
        images: { $first: "$items.images" },
        price: { $first: "$items.price" },
        totalSold: { $sum: "$items.quantity" },
        },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
    ]);

    const favorites = await User.aggregate([
    { $unwind: "$favoritesProducts" },
    {
        $group: {
        _id: "$favoritesProducts",
        count: { $sum: 1 },
        },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
    ]);

    const topFavorites = await Product.find({
    _id: { $in: favorites.map((f) => f._id) },
    }).lean();

    const topFavoriteProducts = favorites.map((fav) => {
    const product = topFavorites.find((p) => p._id.toString() === fav._id.toString());
    return {
        ...product,
        favoriteCount: fav.count,
    };
    });

    res.status(200).json({
    recentOrders,
    recentCustomers,
    topSellingItems,
    topFavoriteProducts,
        }); 
} catch (error) {
        console.error("Error in getTableStats    :", error);
        res.status(500).json({ message: "Failed to getgetTableStats." });
  }
};

// 4️⃣. Get pie Charts stats 
const getPieChartsStats = async (req, res) => {
  try {
    // 1️⃣ Product Status Distribution
    const productStatusChart = await Product.aggregate([
      {
        $match: {
          status: { $in: ["In stock", "Out stock", "On order"] }
        }
      },
      {
        $group: {
          _id: "$status",
          value: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          value: 1
        }
      }
    ]);

    // 2️⃣ Order Status Distribution
    const orderStatusChart = await Order.aggregate([
      {
        $match: {
          status: { $in: ["Delivered", "Product Loading", "Out for Delivery"] }
        }
      },
      {
        $group: {
          _id: "$status",
          value: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          value: 1
        }
      }
    ]);

    // 3️⃣ Top 5 Most Sold Product Brands (from Order.items)
    const topBrandChart = await Order.aggregate([
      { $match: { payment: true } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.brand",
          value: { $sum: "$items.quantity" }
        }
      },
      { $sort: { value: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          name: "$_id",
          value: 1
        }
      }
    ]);
    
    // 4️⃣ Paid Products by SubCategory (from Order.items)
    const paidSubCategoryChart = await Order.aggregate([
      { $match: { payment: true } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.subCategory",
          value: { $sum: "$items.quantity" }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          value: 1
        }
      }
    ]);

    res.status(200).json({
      productStatusChart,
      orderStatusChart,
      paidSubCategoryChart,
      topBrandChart
    });
  } catch (error) {
    console.error("Error in getPieChartsStats:", error);
    res.status(500).json({ message: "Failed to get pie chart stats." });
  }
};



//   this  function   revieve   range key =[today or  week or month or year ]  and the date =previous to extract the Start and the end of the rangeKey retun [start= previous-1 , end = previous+rangeKey]
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

// calculate Percentage Change between current, previous
const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
};


export  {getSummaryCardStats , getLineChartStats ,getTableStats , getPieChartsStats}