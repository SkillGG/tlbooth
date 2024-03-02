import { api } from "@/utils/api";
import { useState } from "react";

interface LoginProps {
  user: string | null;
  setUser: (s: string) => void;
}

export default function Login({ setUser, user }: LoginProps) {
  const [loginError, setLoginError] = useState<string>("");
  const [passInput, setPassInput] = useState("");
  const { mutate, isLoading: isChecking } = api.db.checkPass.useMutation({
    onSuccess: (data) => {
      setPassInput("");
      if (data) {
        setUser("admin");
      } else {
        setLoginError("Wrong pass");
      }
    },
  });
  return (
    <>
      <nav>
        {!user ? (
          <>
            <div className="flex flex-col justify-center">
              <div className="mt-2 flex w-full justify-center gap-x-1">
                <input
                  value={passInput}
                  type="password"
                  placeholder="Auth code"
                  className="rounded-bl-lg rounded-tl-lg p-2 text-gray-800 outline-none"
                  onChange={(e) => setPassInput(e.target.value)}
                  disabled={isChecking}
                />
                <button
                  className="rounded-br-lg rounded-tr-lg border-2 border-slate-200 bg-slate-200 p-2 text-black hover:bg-white"
                  onClick={() => {
                    mutate(passInput);
                  }}
                  disabled={isChecking}
                >
                  Login
                </button>
              </div>
              {loginError && (
                <div className="flex justify-center text-red-600">
                  {loginError}
                </div>
              )}
            </div>
          </>
        ) : null}
      </nav>
    </>
  );
}
