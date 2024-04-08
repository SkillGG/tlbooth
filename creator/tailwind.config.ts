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
      screens: {
        lg: { max: "1050px" },
        sm: { max: "600px" },
      },
    },
  },
  plugins: [],
} satisfies Config;
