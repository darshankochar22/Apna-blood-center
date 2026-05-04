import { Resend } from "resend";
import { Donor } from "@/types/donor";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendThankYouEmail(donor: Donor) {
  if (!donor.email) {
    console.log("No email provided for donor:", donor.full_name);
    return;
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-w-2xl mx-auto p-8 bg-black text-white border border-gray-800 rounded-3xl">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; font-size: 28px; margin-bottom: 10px;">Apna Blood Center</h1>
        <p style="color: #888; font-size: 16px;">Certificate of Blood Donation</p>
      </div>
      
      <div style="background-color: #111; padding: 30px; rounded-2xl; border: 1px solid #333;">
        <p style="font-size: 18px; color: white; margin-bottom: 20px;">Dear <strong>${donor.full_name}</strong>,</p>
        
        <p style="font-size: 16px; color: #ccc; line-height: 1.6; margin-bottom: 20px;">
          Thank you for your generous blood donation. Your selfless act today has the power to save lives and bring hope to those in critical need.
        </p>

        <div style="background-color: #000; border: 1px solid #333; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #888; border-bottom: 1px solid #222;">Donor ID</td>
              <td style="padding: 10px 0; color: white; font-family: monospace; text-align: right; border-bottom: 1px solid #222;">${donor.donor_code}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #888; border-bottom: 1px solid #222;">Blood Group</td>
              <td style="padding: 10px 0; color: white; font-weight: bold; text-align: right; border-bottom: 1px solid #222;">${donor.blood_group}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #888;">Date</td>
              <td style="padding: 10px 0; color: white; text-align: right;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 14px; color: #888; text-align: center; margin-top: 30px;">
          "A single drop of blood can make a huge difference."<br/>
          Thank you from the team at Apna Blood Center.
        </p>
      </div>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "Apna Blood Center <onboarding@resend.dev>",
      to: [donor.email],
      subject: "Thank You for Your Blood Donation - Apna Blood Center",
      html: htmlContent,
    });

    if (error) {
      console.error("Failed to send email:", error);
    } else {
      console.log("Email sent successfully:", data);
    }
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

export async function sendBirthdayEmail(donor: Donor) {
  if (!donor.email) {
    return { success: false, error: "No email provided for donor" };
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-w-2xl mx-auto p-8 bg-black text-white border border-gray-800 rounded-3xl">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; font-size: 28px; margin-bottom: 10px;">Apna Blood Center</h1>
      </div>
      
      <div style="background-color: #111; padding: 30px; rounded-2xl; border: 1px solid #333;">
        <p style="font-size: 18px; color: white; margin-bottom: 20px;">Dear <strong>${donor.full_name}</strong>,</p>
        
        <p style="font-size: 16px; color: #ccc; line-height: 1.6; margin-bottom: 20px;">
          Wishing you a very Happy Birthday in advance! 🎉<br/><br/>
          As you celebrate another wonderful year, we want to remind you that your blood donation is the greatest gift of life.
          We would love to invite you to donate blood this year and make your birthday even more special by saving a life.
        </p>

        <p style="font-size: 14px; color: #888; text-align: center; margin-top: 30px;">
          "A single drop of blood can make a huge difference."<br/>
          Best wishes from the team at Apna Blood Center.
        </p>
      </div>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "Apna Blood Center <onboarding@resend.dev>",
      to: [donor.email],
      subject: "Happy Birthday! Save a life today - Apna Blood Center",
      html: htmlContent,
    });

    if (error) {
      console.error("Failed to send birthday email:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error: any) {
    console.error("Error sending birthday email:", error);
    return { success: false, error: error.message };
  }
}
