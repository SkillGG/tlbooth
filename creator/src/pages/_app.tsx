import { type AppType } from "next/app";
import { Inter } from "next/font/google";

import { api } from "@/utils/api";

import "@/styles/globals.css";
import { UserProvider } from "@/hooks/login";
import { NovelStoreProvider } from "@/hooks/novelStore";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});
const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <UserProvider loginPage="/login" mainPage="/dashboard">
      <NovelStoreProvider>
        <main className={`font-sans ${inter.variable}`}>
          <Component {...pageProps} />
        </main>
      </NovelStoreProvider>
    </UserProvider>
  );
};

export default api.withTRPC(MyApp);
