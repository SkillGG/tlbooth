import { SignInButton, SignOutButton, useClerk } from "@clerk/nextjs";
import Image from "next/image";
import { NextResponse } from "next/server";
import { useState } from "react";

export default function LoginBar() {
  const { user } = useClerk();

  const [showLogout, setShowLogout] = useState(false);

  return (
    <nav className="grid w-full">
      {!user ? (
        <div className="grid w-full justify-center">
          <SignInButton />
        </div>
      ) : (
        <div className="m-2 grid h-fit w-fit grid-flow-col gap-2 justify-self-end">
          {showLogout && (
            <SignOutButton
              signOutCallback={() => {
                NextResponse.redirect(new URL("/", window.location.href));
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
            src={user?.imageUrl ?? ""}
            alt={user?.fullName ?? ""}
            width={64}
            height={64}
            className="h-10 w-10 cursor-pointer rounded"
          />
        </div>
      )}
    </nav>
  );
}
