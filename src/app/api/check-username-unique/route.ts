import { dbConnect } from "@/lib/connectDB";
import UserModel from "@/models/user.model";
import { z } from "zod";
import { userNameVelidation } from "@/schemas/signUpSchema";

const usernameQuerySchema = z.object({
  username: userNameVelidation
});

export async function GET(required: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(required.url);
    const queryParams = {
      username: searchParams.get("username")
    };

    // validate with zod
    const result = usernameQuerySchema.safeParse(queryParams);
    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(", ")
              : "Invalid query parameters"
        },
        { status: 400 }
      );
    }

    const { username } = result.data;

    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true
    });

    if (existingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken"
        },
        { status: 200 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Username is available"
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error checking username", error);
    return Response.json(
      { success: false, message: "Error checking username" },
      { status: 500 }
    );
  }
}
