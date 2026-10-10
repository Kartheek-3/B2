/* eslint-disable @next/next/no-img-element */
import clsx from "clsx";
// Replaced next/image with native img for Vercel quota

type StatCardProps = {
  type: "appointments" | "pending" | "cancelled";
  count: number;
  label: string;
  icon: string;
};

export const StatCard = ({ count = 0, label, icon, type }: StatCardProps) => {
  return (
    <div
      className={clsx(
        "stat-card border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl backdrop-blur-sm",
        {
          "bg-appointments border-green-500/30 hover:border-green-500/60 hover:shadow-green-950/20":
            type === "appointments",
          "bg-pending border-blue-500/30 hover:border-blue-500/60 hover:shadow-blue-950/20":
            type === "pending",
          "bg-cancelled border-red-500/30 hover:border-red-500/60 hover:shadow-red-950/20":
            type === "cancelled",
        }
      )}
    >
      <div className="flex items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-xl bg-dark-400/50 p-2 border border-dark-500/50 shadow-inner">
          <img
            src={icon}
            height={28}
            width={28}
            alt={label}
            className="size-7 w-fit"
            loading="lazy"
            decoding="async"
          />
        </div>
        <h2 className="text-32-bold text-white tracking-tight">{count}</h2>
      </div>

      <p className="text-14-medium text-light-200/90">{label}</p>
    </div>
  );
};
