import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const validateServerAuth = async (token: string): Promise<any | null> => {
    try {
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: 'YOUR_GOOGLE_CLIENT_ID', 
        });
    
        const payload = ticket.getPayload();
        if (payload) {
          return payload; 
        } else {
          return false; 
        }
      } catch (error) {
        console.error('Error validating token:', error);
        return false;
      }
}

export default validateServerAuth;