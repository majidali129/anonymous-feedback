import mongoose from "mongoose";

type connectionObject = {
  isConnected?: number;
};

const connection: connectionObject = {};

export const dbConnect = async (): Promise<void> => {
  if (connection.isConnected) {
    console.log("DB is already connected");
    return;
  }
  try {
    // if (process.env.VERCEL_ENV === "development") {
    const db = await mongoose.connect(process.env.MONGODB_URI! || "");
    connection.isConnected = db.connections[0].readyState;
    console.log("DB connected successfully 🚀");
    // }
  } catch (error) {
    console.log("DB connection failed 🎆", error);
    process.exit(1);
  }
};
