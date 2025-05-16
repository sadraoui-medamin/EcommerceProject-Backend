import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(
      `${process.env.MONGO_URL}`
    );
    console.log('DB Connected Successfully');
  } catch (error) {
    console.error('DB Connection Failed:', error.message);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
//mongodb+srv://Ecommed:<db_password>@cluster0.dz2hc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
//'mongodb://Ecommed:12345@cluster0-shard-00-00.dz2hc.mongodb.net:27017,cluster0-shard-00-01.dz2hc.mongodb.net:27017,cluster0-shard-00-02.dz2hc.mongodb.net:27017/FMEcomerceBD?ssl=true&replicaSet=atlas-ukayri-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0'