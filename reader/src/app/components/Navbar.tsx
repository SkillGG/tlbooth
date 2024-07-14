import NavLink from "./NavLink";

const Navbar = async () => {
  return (
    <div className="flex max-w-[100%] justify-around pt-2 sm:max-w-[25%]">
      <NavLink href={"/"} page="/">
        Home
      </NavLink>
      <NavLink href={"/about"} page={"/about"}>
        About
      </NavLink>
      <NavLink href={"/"} page={"/search"}>
        Search
      </NavLink>
    </div>
  );
};

export default Navbar;
