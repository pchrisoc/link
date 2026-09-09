import mongoose from "mongoose";

const connectMongoDB = async () => {
    if (mongoose.connection.readyState === 1) return;
    const mongoURI = process.env.MONGODB_URL || process.env.MONGODB_URI;
    if (!mongoURI) {
        throw new Error("Please define the MONGODB_URL environment variable inside .env");
    }
    return mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 10000,
    });
};

export default connectMongoDB;