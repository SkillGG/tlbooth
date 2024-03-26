import {
  SignInButton,
  SignOutButton,
  useClerk,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { NextResponse } from "next/server";
import { useState } from "react";

export default function LoginBar({
  setLoaded,
}: {
  setLoaded: (p: boolean) => void;
}) {
  const { user } = useClerk();

  const router = useRouter();

  const [showLogout, setShowLogout] = useState(false);

  console.log(window.location.pathname);

  const onDashboard =
    window.location.pathname.includes("dashboard");

  return (
    <nav className="grid w-full min-w-12">
      {!user ?
        <div className="grid w-full justify-center">
          <SignInButton />
        </div>
      : <div className="grid h-fit w-full grid-flow-col p-2">
          {!onDashboard && (
            <div className="grid h-full content-center">
              <Link href="/">Dashboard</Link>
            </div>
          )}
          <div className="grid h-fit w-fit grid-flow-col justify-self-end">
            {showLogout && (
              <SignOutButton
                signOutCallback={() => {
                  void router.replace(
                    new URL("/", window.location.href),
                  );
                }}
              >
                <button className="m-0 h-10 w-full border-2 border-red-500 pl-3 pr-3 text-white">
                  Sign out
                </button>
              </SignOutButton>
            )}
            <Image
              onClick={() => {
                setShowLogout((p) => !p);
              }}
              onLoad={() => {
                setLoaded(true);
              }}
              src={user?.imageUrl ?? ""}
              alt={user?.fullName ?? ""}
              width={64}
              height={64}
              className="h-10 w-10 cursor-pointer rounded"
            />
          </div>
        </div>
      }
    </nav>
  );
}
