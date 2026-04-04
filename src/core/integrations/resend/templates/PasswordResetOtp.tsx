import { OtpEmail } from "./OtpEmail";

export function PasswordResetOtp(props: {
  otp: string;
  organizationName: string;
  supportEmail: string;
}) {
  return (
    <OtpEmail
      {...props}
      title="Reset Your Password"
      description="Use the OTP below to reset your password securely."
    />
  );
}