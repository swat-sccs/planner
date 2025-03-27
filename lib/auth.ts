import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import type { NextAuthOptions } from "next-auth";

import KeycloakProvider, {
  KeycloakProfileToken,
} from "next-auth/providers/keycloak";
import { getServerSession } from "next-auth";

declare module "next-auth/providers/keycloak" {
  export interface KeycloakProfileToken extends KeycloakProfile {
    realm_access: { roles: [string] };
  }
}
function parseJwt(token: string) {
  return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
}
// You'll need to import and pass this
// to `NextAuth` in `app/api/auth/[...nextauth]/route.ts`
export const config = {
  //Set custom redirect pages

  providers: [
    KeycloakProvider({
      profile(profile, tokens) {
        const tokenData: KeycloakProfileToken = parseJwt(
          tokens.access_token || ""
        );

        let theRole;

        if ("planner" in tokenData.resource_access) {
          theRole = tokenData.resource_access.planner.roles.find(
            (role: string) => role === "admin" || "user"
          );
        } else {
          theRole = "user";
        }

        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,

          ///THE DUMB OLD WAY BELOW
          //MAKE SURE TO ADD GROUPS UNDER client scopes ->[currentproject]-dedicated
          //If you don't it wont redirect

          //New way is to add a role under client scopes-> roles
          // Then assign that role to your user specifically
          role:
            //tokenData.resource_access.scheduler.roles.find( (role: string) => role === "admin" || "user"),
            //profile.groups.find((group: string) => group === "admin") || "user",
            theRole,
        };
      },
      clientId: process.env.KEYCLOAK_ID || "",
      clientSecret: process.env.KEYCLOAK_SECRET || "",
      issuer: process.env.KEYCLOAK_ISSUER,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;

      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.id = token.sub || "";
      return session;
    },
  },
} satisfies NextAuthOptions;

// Use it in server contexts
export function auth(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, config);
}
