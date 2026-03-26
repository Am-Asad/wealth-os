"use client";
import Link from "next/link";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const LandingPage = () => {
  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Wealth OS</CardTitle>
          <CardDescription>
            Personal finance cockpit built around your 5-bucket model.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Authenticated>
            <Button asChild className="w-full">
              <Link href="/dashboard">Open dashboard</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/setup">Continue setup wizard</Link>
            </Button>
          </Authenticated>
          <Unauthenticated>
            <SignInButton>
              <Button className="w-full hover:cursor-pointer hover:opacity-80">Sign in</Button>
            </SignInButton>
          </Unauthenticated>
        </CardContent>
      </Card>
    </div>
  );
};

export default LandingPage;
