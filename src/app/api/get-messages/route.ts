import { dbConnect } from "@/lib/connectDB";
import UserModel from "@/models/user.model";
import { User } from "next-auth";
import { auth } from "../../../../auth";
import mongoose from "mongoose";

export async function GET(request: Request) {
  await dbConnect();
  const session = await auth();
  const _user: User = session?.user;

  if (!session || !_user) {
    return Response.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  const userId = new mongoose.Types.ObjectId(_user._id);

  try {
    const user = await UserModel.aggregate([
      {
        $match: { _id: userId }
      },
      {
        $unwind: "$messages"
      },
      {
        $sort: { "messages.createdAt": -1 }
      },
      {
        $group: {
          _id: "$_id",
          messages: { $push: "$messages" }
        }
      }
    ]);

    if (!user || user.length === 0) {
      return Response.json(
        { message: "Messages not found", success: false },
        { status: 404 }
      );
    }

    return Response.json(
      { messages: user[0].messages, success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("An unexpected error occured", error);
    return Response.json(
      { message: "An unexpected error occured", success: false },
      { status: 500 }
    );
  }
}
