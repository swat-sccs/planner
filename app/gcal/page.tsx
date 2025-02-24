"use client";

import React from "react";
import oauth2Client from "../../lib/google-oauth";

import crypto from "crypto";
import { getCal } from "../actions/gcal";
import { useRouter } from "next/router";
import { Button } from "@nextui-org/button";

export default function RatingPage() {
  const router = useRouter();
  const SCOPE = [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive.appdata",
    "https://www.googleapis.com/auth/drive.photos.readonly",
  ];
  let authorizationUrl = "";
  async function runit() {
    const thing = getCal();
    console.log(thing);

    //where do i store this state
    const state = crypto.randomBytes(16).toString("hex");

    //generate the url
    authorizationUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPE,
      state,
    });
    router.push(authorizationUrl);
  }

  return (
    <>
      <div className=" pt-5 sm:pt-0 sm:h-[83vh] h-[80vh] scrollbar-thin scrollbar-thumb-accent-500 scrollbar-track-transparent">
        <Button onPress={runit}>Sign In with Google!</Button>
      </div>
    </>
  );
}
