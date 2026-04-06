import React from "react";
import { RegistrationSuccessEmail } from "./templates/RegistrationSuccessEmail";
import { EmailVerificationOtp } from "./templates/EmailVerificationOtp";
import { PasswordResetOtp } from "./templates/PasswordResetOtp";
import { LoginOtp } from "./templates/LoginOtp";
import { resend } from "./resend.client";
import { OrganizationDeletionOtp } from "./templates/OrganizationDeletionOtp";
import { OrganizationInvitationEmail } from "./templates/OrganizationInvitationEmail";
import { InvitationWithProjects } from "@/src/modules/organization/organisation.types";

type SendEmailOptions = {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
};

const sendEmail = async ({ to, subject, react }: SendEmailOptions) => {
  try {
    const response = await resend.emails.send({
      from: `Finance Dashboard <${process.env.RESEND_SENDER_EMAIL}>`,
      to,
      subject,
      react,
    });
    return response;
  } catch (error) {
    console.error("❌ Email send failed:", error);
    throw new Error("Failed to send email");
  }
};

const sendLoginOtpEmail = async (email: string, otp: string) => {
  const reactNode = (
    <LoginOtp
      otp={otp}
      organizationName="Finance Dashboard"
      supportEmail={process.env.RESEND_SUPPORT_EMAIL??""}
    />
  );
  return sendEmail({
    to: email,
    subject: "Your Login OTP",
    react: reactNode,
  });
};

const sendEmailVerificationOtp = async (
  email: string,
  otp: string
) => {
  return sendEmail({
    to: email,
    subject: "Verify your email",
    react: (
      <EmailVerificationOtp
        otp={otp}
        organizationName="Finance Dashboard"
        supportEmail={process.env.RESEND_SUPPORT_EMAIL??""}
      />
    ),
  });
};

const sendPasswordResetOtp = async (
  email: string,
  otp: string
) => {
  return sendEmail({
    to: email,
    subject: "Reset your password",
    react: (
      <PasswordResetOtp
        otp={otp}
        organizationName="Finance Dashboard"
        supportEmail={process.env.RESEND_SUPPORT_EMAIL??""}
      />
    ),
  });
};

const sendRegistrationSuccessEmail = async (
  email: string,
  name: string
) => {
  return sendEmail({
    to: email,
    subject: "Welcome to Finance Dashboard 🎉",
    react: (
      <RegistrationSuccessEmail
        userName={name}
        organizationName="Finance Dashboard"
        supportEmail={process.env.RESEND_SUPPORT_EMAIL??""}
      />
    ),
  });
};

const sendOrgDeletionOtp = async (email: string, otp: string, organizationName: string) => {
  return sendEmail({
    to: email,
    subject: "Organization Deletion OTP",
    react: (
      <OrganizationDeletionOtp
        otp={otp}
        organizationName="Finance Dashboard"
        userOrganizationName={organizationName}
        supportEmail={process.env.RESEND_SUPPORT_EMAIL??""}
      />
    ),
  });
}

const sendOrganizationInvitationEmail = async (email: string, organizationName: string, invitation: InvitationWithProjects) => {
  return sendEmail({
    to: email,
    subject: `Invitation to join ${organizationName} on Finance Dashboard`,
    react: (
      <OrganizationInvitationEmail
        organizationName={"Finance Dashboard"}
        userOrganizationName={organizationName}
        supportEmail={process.env.RESEND_SUPPORT_EMAIL??""}
        invitation={invitation}
      />
    ),
  });
}

export default {
  sendLoginOtpEmail,
  sendEmailVerificationOtp,
  sendPasswordResetOtp,
  sendRegistrationSuccessEmail,
  sendOrgDeletionOtp,
sendOrganizationInvitationEmail
};
