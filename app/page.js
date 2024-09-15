"use client";

import ToastCont from "@/components/ToastCont";
import DashBoard from "@/pages/DashBoard";
import { useSession, signIn, signOut } from "next-auth/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const { data: session } = useSession();

  const handleSignIn = async () => {
    try {
      await signIn("google", {
        callbackUrl: window.location.href, // Redirect to the current page
      });
    } catch (error) {
      toast.error("Failed to sign in.");
    }
  };

  const handleSignOut = () => {
    signOut({
      callbackUrl: window.location.href, // Redirect to the current page
    });
  };

  return (
    <>
      <ToastCont />
      <DashBoard
        session={session}
        signIn={handleSignIn}
        signOut={handleSignOut}
      />
    </>
  );
}
