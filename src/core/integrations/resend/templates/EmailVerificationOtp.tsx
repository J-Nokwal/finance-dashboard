import { OtpEmail } from "./OtpEmail";

export function EmailVerificationOtp(props: {
  otp: string;
  organizationName: string;
  supportEmail: string;
}) {
  return (
    <OtpEmail
      {...props}
      title="Verify Your Email"
      description="Please use the OTP below to verify your email address."
    />
  );
}



