import { useNovelStore } from "@/hooks/novelStore";
import {
  SignInButton,
  SignOutButton,
  useClerk,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import { useState } from "react";

export default function LoginBar({
  setLoaded,
}: {
  setLoaded: (p: boolean) => void;
}) {
  const { user } = useClerk();

  const onDashboard = usePathname()?.includes("dashboard");

  const router = useRouter();

  const [showLogout, setShowLogout] = useState(false);

  const { settings, toggleAlwaysRawEdit } = useNovelStore();

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
              <>
                <div className="mr-2 grid place-content-center">
                  <button
                    onClick={() => toggleAlwaysRawEdit()}
                  >
                    {settings.alwaysRawEdit ?
                      "HTR"
                    : "HTML"}
                  </button>
                </div>
                <SignOutButton
                  signOutCallback={() => {
                    void router.replace(
                      new URL(
                        "/dashboard",
                        window.location.href,
                      ).href,
                    );
                  }}
                >
                  <button className="m-0 h-10 w-full border-2 border-red-500 pl-3 pr-3 text-white">
                    Sign out
                  </button>
                </SignOutButton>
              </>
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
