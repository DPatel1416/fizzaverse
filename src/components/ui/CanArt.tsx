import type { Flavor } from "@/data/flavors";
export function CanArt({
  flavor,
  className = "",
}: {
  flavor: Flavor;
  className?: string;
}) {
  return (
    <img
      className={`can-art ${className}`}
      src={`/cans/${flavor.id}.svg`}
      alt={`${flavor.name} FIZZA can`}
      width={160}
      height={330}
      draggable={false}
    />
  );
}
