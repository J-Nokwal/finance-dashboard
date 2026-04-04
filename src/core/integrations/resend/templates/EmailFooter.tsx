import { Section, Text, Link, Hr } from "@react-email/components";

type EmailFooterProps = {
  organizationName: string;
  supportEmail: string;
};

export function EmailFooter({
  organizationName,
  supportEmail,
}: EmailFooterProps) {
  return (
    <>
      <Hr style={hr} />
      <Section style={footer}>
        <Text>
          Built by Jagrit Nokwal
          <br />
          <Link href={`https://jagritnokwal.com`}>🌐 Portfolio https://jagritnokwal.com</Link>
          <br />
          <Link href="https://www.linkedin.com/in/jagrit-nokwal ">💼 https://linkedin.com/in/jagrit-nokwal</Link>
          <br /> 
          <Link href="https://github.com/J-NOKWAL">https://github.com/J-NOKWAL</Link>
        </Text>
        <Text style={{ marginTop: "8px" }}>
          Note: This application is a personal project and not intended for full
          production use.
        </Text>
      </Section>
    </>
  );
}

const footer = {
  fontSize: "12px",
  color: "#777777",
  textAlign: "center" as const,
};

const hr = {
  borderColor: "#e6e6e6",
  margin: "12px 0",
};
