import { type AppType } from "next/app";
import { Inter } from "next/font/google";

import { api } from "@/utils/api";

import "@/styles/globals.css";
import { UserProvider } from "@/hooks/login";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});
const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <UserProvider>
      <main className={`font-sans ${inter.variable}`}>
        <Component {...pageProps} />
      </main>
    </UserProvider>
  );
};

export default api.withTRPC(MyApp);
