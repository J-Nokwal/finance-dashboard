import { sendRegistrationSuccessEmail } from "../src/core/integrations/resend/resend.service";

function testResend() {
  console.log("This is a test for the resend functionality.");
  sendRegistrationSuccessEmail("jagritnokwal9@gmail.com", "Jagrit").then(() => {
    console.log("Email sent successfully!");
  }).catch((error) => {
    console.error("Error sending email:", error);
  });
}

testResend();