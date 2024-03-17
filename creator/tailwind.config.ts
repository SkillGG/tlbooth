import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

import colors from "tailwindcss/colors";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      colors: {
        chapstate: {
          dbonly: colors.blue[200],
          localonly: colors.yellow[300],
          good: colors.green[400],
        },
      },
    },
    screens: {
      lg: "1050px",
    },
  },
  plugins: [],
} satisfies Config;
