import { Section, Text } from "@react-email/components";

export function OtpBox({ otp }: { otp: string }) {
  return (
    <Section style={container}>
      <Text style={label}>Your OTP Code</Text>
      <Text style={otpStyle}>{otp}</Text>
      <Text style={hint}>This code expires in 10 minutes</Text>
    </Section>
  );
}

const container = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const label = {
  fontSize: "14px",
  color: "#555",
};

const otpStyle = {
  fontSize: "32px",
  fontWeight: "bold",
  letterSpacing: "6px",
  margin: "12px 0",
};

const hint = {
  fontSize: "12px",
  color: "#888",
};