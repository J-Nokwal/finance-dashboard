import { Link, Section } from "@react-email/components";
import { BaseEmail } from "./BaseEmail";
import { EmailFooter } from "./EmailFooter";
import { EmailTitle } from "./EmailTitle";
import { Invitation } from "@/generated/prisma/browser";
import { Project } from "@/generated/prisma/browser";
import { Project$invitesArgs } from "@/generated/prisma/models";
import { InvitationWithProjects } from "@/src/modules/organization/organisation.types";

export function OrganizationInvitationEmail(props: {
  organizationName: string;
  supportEmail: string;
  userOrganizationName: string;
  invitation: InvitationWithProjects;
}) {
  const title = `You're Invited to Join ${props.organizationName}`;
  return (
    <BaseEmail previewText={title}>
      <EmailTitle
        logoUrl="https://www.jagritnokwal.com/images/finance-dashboard-logo.png"
        organizationName={props.organizationName}
        title={title}
      />
      <Section style={{ paddingTop: "12px" }}>
        {/* Your are invited to join {props.organizationName} team and its projets */}
        <p>
          You have been invited to join the "{props.organizationName}"
          organization on our platform. As a member of this organization, you
          will have access to its projects.
        </p>
        <ul>
          {props.invitation.projectInvites.map((projectInvite) => (
            <li key={projectInvite.id}>{projectInvite.project.name}</li>
          ))}
        </ul>
        <p>To accept this invitation, please click the button below:</p>
        <Link
          href={`${process.env.FRONTEND_URL}/accept-invitation?token=${props.invitation.token}`}
          style={{
            display: "inline-block",
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "#ffffff",
            textDecoration: "none",
            borderRadius: "4px",
            marginTop: "20px",
          }}
        >
          Accept Invitation
        </Link>
        <p style={{ marginTop: "20px" }}>
          If you did not expect this invitation, you can safely ignore this
          email. If you have any questions, please contact our support team at{" "}
          {props.supportEmail}.
        </p>
        {/* Valid until {props.invitation.expiresAt} */}
        <p style={{ marginTop: "20px", fontSize: "12px", color: "#888888" }}>
          This invitation will expire on{" "}
          {props.invitation.expiresAt.toLocaleDateString()} at{" "}
          {props.invitation.expiresAt.toLocaleTimeString()}.
        </p>
      </Section>
      <EmailFooter
        organizationName={props.organizationName}
        supportEmail={props.supportEmail}
      />
    </BaseEmail>
  );
}
