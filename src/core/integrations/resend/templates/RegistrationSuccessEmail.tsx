import { Section, Text } from "@react-email/components";
import { BaseEmail } from "./BaseEmail";
import { EmailTitle } from "./EmailTitle";
import { EmailFooter } from "./EmailFooter";

type Props = {
  userName: string;
  organizationName: string;
  supportEmail: string;
};

export function RegistrationSuccessEmail({
  userName,
  organizationName,
  supportEmail,
}: Props) {
  return (
    <BaseEmail previewText="Welcome to Finance Dashboard">
      <EmailTitle
        logoUrl="https://www.jagritnokwal.com/images/finance-dashboard-logo.png"
        organizationName={organizationName}
        title="Welcome 🎉"
      />

      <Section style={{ paddingTop: "12px", lineHeight: "1.6" }}>
        <Text>Hi {userName},</Text>

        <Text>
          Your account has been successfully created. You can now start managing
          your financial data, track insights, and explore analytics.
        </Text>

        <Text>
          We’re excited to have you onboard 🚀
        </Text>
      </Section>

      <EmailFooter
        organizationName={organizationName}
        supportEmail={supportEmail}
      />
    </BaseEmail>
  );
}