import { Section, Img, Text } from "@react-email/components";

type EmailTitleProps = {
  logoUrl: string;
  organizationName: string;
  title: string;
};

export function EmailTitle({
  logoUrl,
  organizationName,
  title,
}: EmailTitleProps) {
  return (
    <Section style={section}>
      <Img
        src={logoUrl}
        alt={`${organizationName} logo`}
        width="200"
        style={{ margin: "0 auto" }}
      />
      <Text style={titleStyle}>{title}</Text>
    </Section>
  );
}

const section = {
  textAlign: "center" as const,
  paddingBottom: "12px",
  borderBottom: "1px solid #e6e6e6",
};

const titleStyle = {
  marginTop: "12px",
};
