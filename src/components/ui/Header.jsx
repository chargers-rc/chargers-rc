import ChargersLogo from "@/assets/DriverPortalLogo_400x200.png";
import useTheme from "@app/providers/useTheme";

export default function Header() {
  const { theme } = useTheme();

  return (
    <header className="w-full flex flex-col items-center py-6">
      <img
        src={ChargersLogo}
        alt="Chargers RC Logo"
        className="h-14 w-auto block select-none pointer-events-none"
      />

      <div
        className="w-full h-[3px] mt-4"
        style={{ backgroundColor: theme.colors.primary }}
      />
    </header>
  );
}
