import { authMiddleware, clerkClient } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: ["/"],
  async afterAuth(auth, req, _) {
    // Redirect non logged-in users to login page
    if (!auth.userId && !auth.isPublicRoute) {
      return NextResponse.redirect(
        new URL("/", req.nextUrl.href),
      );
    }
    // Return 403 for non-logged in API calls
    if (!auth.userId && auth.isApiRoute) {
      console.error("Accessing API w/o auth!", auth.userId);
      return NextResponse.rewrite(
        new URL("/403.json", req.url),
        {
          status: 403,
        },
      );
    }
    // Redirect logged in default page to dashboard
    if (auth.userId && req.nextUrl.pathname === "/") {
      const dashboard = new URL("/dashboard", req.nextUrl);
      return NextResponse.redirect(dashboard);
    }
    // Check if user is "admin". Add/remove the query param if needed
    if (auth.userId && !auth.isApiRoute) {
      const { privateMetadata } =
        await clerkClient.users.getUser(auth.userId);
      const url = new URL("", req.nextUrl.href);
      console.log("bef", url.href, privateMetadata);
      if (privateMetadata?.type === "admin") {
        if (!url.searchParams.has("admin")) {
          url.searchParams.set("admin", "");
          console.log("aft", url.href);
          return NextResponse.redirect(url);
        }
      } else {
        if (url.searchParams.has("admin")) {
          url.searchParams.delete("admin");
          console.log("aft", url);
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
