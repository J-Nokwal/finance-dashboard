import { Section, Text } from "@react-email/components";
import { BaseEmail } from "./BaseEmail";
import { EmailTitle } from "./EmailTitle";
import { EmailFooter } from "./EmailFooter";
import { OtpBox } from "./OtpBox";

type Props = {
  otp: string;
  title: string;
  description: string;
  organizationName: string;
  supportEmail: string;
};

export function OtpEmail({
  otp,
  title,
  description,
  organizationName,
  supportEmail,
}: Props) {
  return (
    <BaseEmail previewText={title}>
      <EmailTitle
        logoUrl="https://your-logo-url.com/logo.png"
        organizationName={organizationName}
        title={title}
      />

      <Section style={{ paddingTop: "12px" }}>
        <Text>{description}</Text>

        <OtpBox otp={otp} />
      </Section>

      <EmailFooter
        organizationName={organizationName}
        supportEmail={supportEmail}
      />
    </BaseEmail>
  );
}