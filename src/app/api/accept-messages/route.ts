import dbConnect from "@/lib/connectDB";
import UserModel from "@/models/user.model";
import { User } from "next-auth";
import { auth } from "../../../../auth";

export async function POST(request: Request) {
  await dbConnect();
  const session = await auth();
  const _user: User = session?.user;
  const { acceptMessages } = await request.json();

  if (!session || !_user) {
    return Response.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  const userId = _user._id;

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        isAcceptingMessages: acceptMessages
      },
      { new: true }
    );

    console.log("updated user", updatedUser);
    if (!updatedUser) {
      return Response.json(
        { message: "Failed to updated the user status", success: false },
        { status: 401 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Message acceptance status updated successfully",
        updatedUser
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    return Response.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

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

  const userId = _user._id;

  try {
    const foundUser = await UserModel.findById(userId);
    if (!foundUser) {
      return Response.json(
        {
          success: false,
          message: "User not found"
        },
        { status: 404 }
      );
    }
    return Response.json(
      {
        success: true,
        isAcceptingMessages: foundUser.isAcceptingMessages
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in getting message acceptance status", error);
    return Response.json(
      { message: "Error in getting message acceptance status", success: false },
      { status: 500 }
    );
  }
}
