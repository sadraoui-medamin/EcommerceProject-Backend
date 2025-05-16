import 'dotenv/config.js'
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import bodyParser from 'body-parser';
import productRouter from "./routes/productRouter.js";
import userRouter from "./routes/userRouter.js";
import cartRouter from "./routes/cartRouter.js";
import homeBunnersRouter from "./routes/HomeBunnerRouter.js";
import orderRouter from "./routes/orderRouter.js";
import connectCloudinary from './config/cloudinaryConfig.js';
import reviewRouter from './routes/reviewRouter.js';
import favoriteRouter from './routes/favoritesProductsRouter.js';
import compareRouter from './routes/compareRouter.js';
import adminRouter from './routes/adminRouter.js';
import aboutUsRouter from './routes/aboutUsRouter.js'
import dashboardRouter from './routes/dashboardRouter.js'
// App configuration
const app = express();



// app config
app.use(cors());
app.use(express.json()); // Parse JSON bodies
// Increase the request size limit for JSON payloads
app.use(bodyParser.json({ limit: '10000mb' }));

// Increase the request size limit for URL-encoded payloads
app.use(bodyParser.urlencoded({ limit: '10000mb', extended: true }));

// Alternatively, using Express's built-in methods:
app.use(express.json({ limit: '10000mb' }));
app.use(express.urlencoded({ limit: '10000mb', extended: true }));

//connect BD
connectDB();
// connect cloudinary to store the images 
// Verify Cloudinary Connection
connectCloudinary();

// API routes
app.get("/", (req, res) => {
  res.send("API Working");
});
// api endpoints
app.use("/api/product", productRouter)
app.use("/api/user", userRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)
app.use('/api/reviews', reviewRouter);
app.use("/api/homebunner", homeBunnersRouter);
app.use("/api/favorites", favoriteRouter);
app.use("/api/compares", compareRouter);
app.use("/api/admins", adminRouter);
app.use("/api/aboutUs", aboutUsRouter);
app.use("/api/dashboard", dashboardRouter);


// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server started on http://localhost:${process.env.PORT}`);
});
