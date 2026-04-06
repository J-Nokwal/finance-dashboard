import { OtpEmail } from "./OtpEmail";

export function OrganizationDeletionOtp(props: {
  otp: string;
  organizationName: string;
  supportEmail: string;
  userOrganizationName: string;
}) {
  return (
    <OtpEmail
      {...props}
      title="Confirm Organization Deletion"
      description={`Please use the OTP below to confirm deletion of your organization "${props.userOrganizationName}". This action is irreversible.`}
    />
  );
}