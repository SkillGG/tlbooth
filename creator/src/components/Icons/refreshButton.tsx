import {
  type FC,
  useState,
  type ComponentPropsWithoutRef,
  useEffect,
} from "react";
import { LoadingSpinner } from "./icons";

export const RefreshButton: FC<
  {
    refreshFn: () => Promise<void> | void;
    iconClass?: ComponentPropsWithoutRef<"div">["className"];
    force?: true;
  } & ComponentPropsWithoutRef<"div">
> = ({
  refreshFn,
  className,
  iconClass,
  force,
  children,
}) => {
  const [spinner, setSpinner] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (error.length > 0) {
      const timeout = setTimeout(() => {
        setError("");
      }, 1000);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [error]);

  return (
    <>
      {spinner || force ?
        <div className={className}>
          <LoadingSpinner
            className={iconClass}
            style={{
              "--accent": "transparent",
              "--size": "1rem",
              "--weight": "2px",
              "--bg": "green",
            }}
          />
        </div>
      : !!error ?
        <div className={className}>{error}</div>
      : <button
          onClick={async () => {
            try {
              setSpinner(true);
              await refreshFn();
              setSpinner(false);
            } catch (err) {}
          }}
          className={className}
        >
          {children}
        </button>
      }
    </>
  );
};
