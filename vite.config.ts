import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/index.ts"],
    dts: true,
    format: ["esm"],
  },
  lint: { options: { typeAware: true, typeCheck: true } },
  test: { include: ["test/**/*.test.ts"] },
});
