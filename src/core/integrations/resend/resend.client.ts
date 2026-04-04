import { Resend } from "resend";
console.log("ENV:", process.env.RESEND_API_KEY?.substring(0, 4) + "****"); // Log the first 4 characters of the API key for verification
export const resend = new Resend(process.env.RESEND_API_KEY);