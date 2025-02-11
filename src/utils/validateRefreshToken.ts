import { OAuth2Client } from "google-auth-library";
import { UnauthenticatedError } from "../errors";

const CLIENT_ID = process.env.WEB_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_WEB_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error(
    "Missing CLIENT_ID or CLIENT_SECRET in environment variables."
  );
}

const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, "postmessage");

const validateRefreshToken = async (refreshToken: string) => {
  try {
    client.setCredentials({
      refresh_token: refreshToken,
    });

    const { credentials } = await client.refreshAccessToken();

    return {
      status: true,
      id_token: credentials.id_token,
      access_token: credentials.access_token,
    };
  } catch (error: any) {
    if (error.message && error.message.includes("Token used too late")) {
      return { status: false, message: "Token used too late" };
    }
    return { status: false, message: error.message };
  }
};

export default validateRefreshToken;
