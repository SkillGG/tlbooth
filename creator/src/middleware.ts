import { authMiddleware, clerkClient } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  async afterAuth(auth, req, _) {
    // Handle users who aren't authenticated

    // console.log(auth, req.nextUrl.pathname);

    // if (!auth.userId && req.nextUrl.pathname !== "/") {
    //   if (req.nextUrl.pathname.startsWith("/api")) {
    //     return NextResponse.rewrite(
    //       new URL("/403.json", req.url),
    //       {
    //         status: 403,
    //       },
    //     );
    //   }
    //   return NextResponse.redirect(new URL("/", req.url));
    // }
    // If the user is signed in and trying to access a protected route, allow them to access route
    if (auth.userId && req.nextUrl.pathname === "/") {
      const dashboard = new URL("/dashboard", req.nextUrl);
      return NextResponse.redirect(dashboard);
    }
    if (auth.userId) {
      const { privateMetadata } =
        await clerkClient.users.getUser(auth.userId);
      const url = new URL("", req.nextUrl);
      if (privateMetadata?.type === "admin") {
        if (!url.searchParams.has("admin")) {
          url.searchParams.set("admin", "");
          return NextResponse.redirect(url);
        }
      } else {
        if (url.searchParams.has("admin")) {
          url.searchParams.delete("admin");
          return NextResponse.redirect(url);
        }
      }
    }

    // Allow users visiting public routes to access them
    return NextResponse.next();
  },
});

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
