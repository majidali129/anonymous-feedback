import { resend } from "@/lib/resend";
import { ApiResponse } from "@/types/ApiResponse";
import VerificationEmail from "../../emails/VerificationEmail";

const sendVerificationEmail = async (
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> => {
  try {
    const { data } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: email,
      subject: "Mystery Message Verification Code",
      react: VerificationEmail({ username, otp: verifyCode })
    });
    console.log("Email verification send response ", data);
    return {
      success: true,
      message: "Verification email sent successfully ✅"
    };
  } catch (emailError) {
    console.log("Error sending verification email 🎆", emailError);
    return {
      success: false,
      message: "Failed to send verification email."
    };
  }
};

export default sendVerificationEmail;
