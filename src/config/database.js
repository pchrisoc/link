import mongoose from "mongoose";

const connectMongoDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    const mongoURI = process.env.MONGODB_URL; // Adjust if using a different variable name
    if (!mongoURI) {
        throw new Error("Please define the MONGODB_URL environment variable inside .env");
    }
    return mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
};

export default connectMongoDB;