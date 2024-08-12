import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import sendVerificationEmail from "@/helpers/sendVerificationEmail";
import UserModel from "@/models/user.model";
import dbConnect from "@/lib/connectDB";

export const POST = async (request: NextRequest) => {
  await dbConnect();
  try {
    const { email, password, username } = await request.json();

    const existingUserByUsername = await UserModel.findOne({
      username,
      isVerified: true
    });
    if (existingUserByUsername) {
      return NextResponse.json(
        {
          success: false,
          message: "User with credentials already exists"
        },
        { status: 400 }
      );
    }

    const existingUserByEmail = await UserModel.findOne({ email });

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return NextResponse.json(
          {
            success: false,
            message: "user already exists with this email"
          },
          { status: 400 }
        );
      } else {
        const hashedPassword = await bcryptjs.hash(password, 10);
        const verifyCode = Math.floor(10000 + Math.random() * 90000).toString();
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 360000);
        await existingUserByEmail.save();
      }
    } else {
      const hashedPassword = await bcryptjs.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const verifyCode = Math.floor(10000 + Math.random() * 90000).toString(); // 5 digit code

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode: verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessages: true,
        messages: []
      });

      await newUser.save();

      // send verification email
      const emailResponse = await sendVerificationEmail(
        email,
        username,
        verifyCode
      );

      if (!emailResponse.success) {
        return NextResponse.json(
          {
            success: false,
            message: emailResponse.message
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "User registered successfully. please verify your email"
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.log("Error registering user", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error registering user"
      },
      {
        status: 500
      }
    );
  }
};
