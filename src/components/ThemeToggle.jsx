import useTheme from "@app/providers/useTheme";

export default function ThemeToggle() {
  const { theme, updateTheme } = useTheme();
  const isDark = theme.dark || false;

  const toggleDark = () => {
    updateTheme({ dark: !isDark });

    if (!isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      onClick={toggleDark}
      className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 dark:text-white"
    >
      {isDark ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
