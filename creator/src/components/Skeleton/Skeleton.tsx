import styles from "./skeleton.module.css";

export function Skeleton({
  className,
  children,
  empty,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { empty?: true }) {
  if (empty) return <div className="h-full min-h-4"></div>;
  return (
    <>
      <div className={`${styles.skeleton} ${className}`} {...props}></div>
      {children}
    </>
  );
}
