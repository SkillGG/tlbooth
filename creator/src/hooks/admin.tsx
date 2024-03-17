import {
  type PropsWithChildren,
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

const adminContext = createContext(false);

export const AdminCheckProvider = ({
  children,
}: PropsWithChildren) => {
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    setAdmin(!!/(\?|&)admin=/.exec(window.location.search));
  }, []);
  return (
    <adminContext.Provider value={admin}>
      {children}
    </adminContext.Provider>
  );
};

export const useAdmin = () => {
  const ctx = useContext(adminContext);
  if (ctx === null)
    throw "useAdmin only inside AdminCheckProvider";
  return ctx;
};
