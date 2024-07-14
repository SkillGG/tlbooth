"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import NavCSS from "./nav.module.css";

const NavLink = ({
  href,
  page,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"a"> & {
  href: string;
  page: RegExp | string;
}) => {
  const path = usePathname();

  const isPage = () => {
    return typeof page === "string" ? path === page : !!page.exec(path);
  };

  return (
    <Link
      href={href}
      className={`${className} ${isPage() ? NavCSS.onpage : NavCSS.otherpage}`}
      {...props}
    >
      {props.children}
    </Link>
  );
};

export default NavLink;
