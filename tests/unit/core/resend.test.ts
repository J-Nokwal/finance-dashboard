// import { sendLoginOtpEmail } from "../../../src/core/integrations/resend/resend.service";

// describe("sendLoginOtpEmail (real resend)", () => {
//   beforeAll(() => {
//     if (!process.env.RESEND_API_KEY) {
//       throw new Error("RESEND_API_KEY is not set");
//     }
//   });

//   it("should send OTP email successfully", async () => {
//     const email = "jagritnokwal9@gmail.com"; // ⚠️ will receive real email
//     const otp = "123456";

//     const result = await sendLoginOtpEmail(email, otp);

//     expect(result).toBeDefined();
//   });

//   it("should fail with invalid email", async () => {
//     const email = "invalid-email";
//     const otp = "123456";

//     await expect(
//       sendLoginOtpEmail(email, otp)
//     ).rejects.toThrow();
//   });
// });

import { sendLoginOtpEmail } from "../../../src/core/integrations/resend/resend.service";
import { resend } from "../../../src/core/integrations/resend/resend.client";

// ✅ Mock the resend client entirely
jest.mock("../../../src/core/integrations/resend/resend.client", () => ({
  resend: {
    emails: {
      send: jest.fn().mockResolvedValue({ id: "mock-email-id" })
    }
  }
}));

describe("sendLoginOtpEmail", () => {
  it("should send OTP email successfully", async () => {
    const result = await sendLoginOtpEmail("jagritnokwal9@gmail.com", "123456");
    
    expect(resend.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "jagritnokwal9@gmail.com",
        subject: "Your Login OTP",
      })
    );
    expect(result).toEqual({ id: "mock-email-id" });
  });

  it("should fail with invalid email", async () => {
    (resend.emails.send as jest.Mock).mockRejectedValueOnce(
      new Error("Invalid email")
    );

    await expect(
      sendLoginOtpEmail("invalid-email", "123456")
    ).rejects.toThrow("Failed to send email");
  });
});