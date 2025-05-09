import nextAuth from "next-auth";
import Facebook from "next-auth/providers/facebook";

import Google from "next-auth/providers/google";

const handler = nextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
});

export { handler as GET, handler as POST };
