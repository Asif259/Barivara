import { cx } from "@/utils/cx";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx("animate-pulse rounded-xl bg-background-secondary-default", className)}
      {...props}
    />
  );
}

export { Skeleton };
