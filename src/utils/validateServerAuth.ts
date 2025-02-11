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

const validateServerAuth = async (code: string): Promise<any | null> => {
  try {
    const { tokens } = await client.getToken({
      code: code,
    });

    if (
      !tokens ||
      !tokens.id_token ||
      !tokens.refresh_token ||
      !tokens.access_token
    ) {
      throw new UnauthenticatedError("Invalid Token");
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (payload) {
      return {
        status: true,
        payload,
        refresh_token: tokens.refresh_token,
        id_token: tokens.id_token,
      };
    } else {
      return { status: false };
    }
  } catch (error: any) {
    if (error.message && error.message.includes("Token used too late")) {
      return { status: false, message: "Token used too late" };
    }
    return { status: false, message: error.message };
  }
};

export default validateServerAuth;
