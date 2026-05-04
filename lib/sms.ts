import twilio from "twilio";
import { Donor } from "@/types/donor";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Only initialize if keys exist
const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function sendThankYouSMS(donor: Donor) {
  if (!client || !twilioPhoneNumber) {
    console.log("Twilio credentials not configured, skipping SMS.");
    return;
  }

  if (!donor.phone) {
    console.log("No phone number provided for donor:", donor.full_name);
    return;
  }

  // Ensure the phone number has a country code. If not, default to India (+91)
  let phoneNumber = donor.phone.trim();
  if (!phoneNumber.startsWith('+')) {
    phoneNumber = `+91${phoneNumber}`;
  }

  const messageBody = `Hello ${donor.full_name}, thank you for your generous blood donation (Group: ${donor.blood_group}) at Apna Blood Center today. Your selfless act will save lives!`;

  try {
    const message = await client.messages.create({
      body: messageBody,
      from: twilioPhoneNumber,
      to: phoneNumber,
    });

    console.log("SMS sent successfully, SID:", message.sid);
  } catch (error) {
    console.error("Error sending SMS via Twilio:", error);
  }
}
