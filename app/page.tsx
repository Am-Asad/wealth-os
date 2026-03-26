"use client";
import { Unauthenticated } from "convex/react";
import { SignInButton } from "@clerk/nextjs";

const LandingPage = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <Unauthenticated>
        <SignInButton>
          <button className="bg-blue-500 text-white p-2 rounded-md">
            Sign in
          </button>
        </SignInButton>
      </Unauthenticated>
    </div>
  );
};

export default LandingPage;
