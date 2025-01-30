import axios from "axios";

export const confirmationEmail = async (email: string, otp: string) => {
  try {
    const response = await axios.post(
      process.env.BREVO_BASE_URL!,
      {
        sender: {
          name: "Lilo",
          email: "lilotravelph@gmail.com",
        },
        to: [
          {
            email: email,
          },
        ],
        subject: "Confirm your email address",
        htmlContent: `
        <h1>Welcome to Lilo!</h1>
        <p>OTP for email confirmation don't share this to anyone</p>
        <h1>${otp}</h1>`,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return { data: response.data, status: "success" };
  } catch (error: any) {
    console.log(error);
    return { data: null, status: "error" };
  }
};
