"use client";
import { Unauthenticated } from "convex/react";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

const LandingPage = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <Unauthenticated>
        <SignInButton>
          <Button className="hover:cursor-pointer hover:opacity-80">
            Sign in
          </Button>
        </SignInButton>
      </Unauthenticated>
    </div>
  );
};

export default LandingPage;
