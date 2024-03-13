import { type FC, useState, type ComponentPropsWithoutRef } from "react";
import { LoadingSpinner } from "./loadingIcons";

export const RefreshButton: FC<
  {
    refreshFn: () => Promise<void> | void;
  } & ComponentPropsWithoutRef<"div">
> = ({ refreshFn, style, className }) => {
  const [spinner, setSpinner] = useState(false);

  return (
    <>
      {spinner ? (
        <LoadingSpinner
          className={className}
          style={{
            "--accent": "transparent",
            "--size": "1rem",
            "--weight": "2px",
            "--bg": "green",
          }}
        />
      ) : (
        <button
          onClick={async () => {
            setSpinner(true);
            await refreshFn();
            setSpinner(false);
          }}
          className={className}
        >
          Refresh
        </button>
      )}
    </>
  );
};
