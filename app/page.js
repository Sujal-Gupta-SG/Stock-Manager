"use client";
import ToastCont from "@/components/ToastCont";
import DashBoard from "@/pages/DashBoard";
import { useSession, signIn, signOut } from "next-auth/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>; // Optionally handle loading state
  }

  const handleSignIn = async () => {
    try {
      await signIn("google", {
        callbackUrl: window.location.href,
      });
    } catch (error) {
      toast.error("Failed to sign in.");
    }
  };

  const handleSignOut = () => {
    signOut({
      callbackUrl: window.location.href,
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
