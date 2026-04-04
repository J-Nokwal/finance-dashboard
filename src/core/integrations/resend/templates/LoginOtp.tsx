import { OtpEmail } from "./OtpEmail";

export function LoginOtp(props: {
  otp: string;
  organizationName: string;
  supportEmail: string;
})  {
  return (
    <OtpEmail
      {...props}
      title="Login Verification Code"
      description="Use this code to securely log into your account."
    />
  );
}