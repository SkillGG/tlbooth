import { type FC, useState, type ComponentPropsWithoutRef } from "react";
import { LoadingSpinner } from "./loadingIcons";

export const RefreshButton: FC<
  {
    refreshFn: () => Promise<void> | void;
    iconClass?: ComponentPropsWithoutRef<"div">["className"];
    force?: true;
  } & ComponentPropsWithoutRef<"div">
> = ({ refreshFn, className, iconClass, force }) => {
  const [spinner, setSpinner] = useState(false);

  return (
    <>
      {spinner || force ? (
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
