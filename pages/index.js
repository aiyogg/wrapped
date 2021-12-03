import React, { useState, useEffect } from "react";
import { isSignedIn, getImageURL } from "../utils/supabase";
import Constants from "../utils/constants";
import Slideshow from "../components/slideshow";
import HeadTags from "../components/headTags";

import SignInOut from "../components/signInOut";
import { initShortcuts } from "../utils/shortcuts";
import { getByUsername } from "../utils/exports";
import { isDev, getUserStats } from "../utils/utils";

export default function Home({ hostUser }) {
  const [user, setUser] = useState(null);
  const [auth, setAuth] = useState(null);

  useEffect(async () => {
    let userStats = await getUserStats();
    setUser(userStats);
    initShortcuts(userStats);
    checkUser();
    window.addEventListener("hashchange", () => checkUser());
  }, [auth]);

  // Check if user is signed in
  async function checkUser() {
    const auth = await isSignedIn();
    if (auth) setAuth(auth);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-black">
      <HeadTags user={hostUser} />

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        {auth ? (
          <h1 className="flex text-4xl font-bold text-white mb-5">
            GitHub <p className="pl-2 text-purple-600">Wrapped</p>
          </h1>
        ) : (
          <h1 className="flex text-8xl font-bold tracking-tighter text-white mb-5 space-x-4">
            <span className="leading-tight">GitHub</span>
            <span className="leading-tight font-mono transition-all ease-in-out duration-700 text-purple-600 hover:text-transparent bg-clip-text bg-gradient-to-l from-[#85259D] via-purple-600 to-[#6B3EEC]">
              Wrapped
            </span>
          </h1>
        )}
        <SignInOut auth={auth} setAuth={setAuth} />
        {auth ? (
          <div>
            <div className="text-white p-5 flex justify-center items-center space-x-5">
              {user.avatarUrl && (
                <img
                  className="w-12 h-12 rounded-full"
                  src={user.avatarUrl}
                  alt={`${user.username}'s avatar'`}
                />
              )}
              <p className="text-2xl font-medium">Welcome, {user.username}.</p>
            </div>
            <Slideshow user={user} />
          </div>
        ) : hostUser ? (
          <div>
            <div className="text-white pt-5">
              Welcome to {hostUser.username}'s year in review.
            </div>
            <div
              className="bg-gradient-to-r from-purple-500 to-indigo-600 mt-5 p-10"
              id="wrap"
            >
              <div className="flex space-x-5 rounded-xl bg-gray-900/80 border border-gray-500">
                <UserHighlights user={hostUser} />
                <TopLanguages user={hostUser} />
              </div>
              <Contributions />
            </div>
          </div>
        ) : (
          <></>
        )}
      </main>
      <footer className=" ">
        <p className="text-gray-300">
          Made by{" "}
          <a
            className="font-bold text-purple-500 hover:text-purple-400"
            href={Constants.NEAT.URL}
          >
            Neat
          </a>
        </p>
      </footer>
    </div>
  );
}

// Server-side rendering for viewing others' Wrapped pages
export const getServerSideProps = async (context) => {
  // Get user from subdomain eg. https://nat.wrapped.run
  let hostUser = null;
  let domainParts = context.req.headers.host.split(".");
  if (domainParts.length > (isDev() ? 1 : 2)) {
    hostUser = await getByUsername(domainParts[0]);
  }

  return {
    props: {
      hostUser,
    },
  };
};
