import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "{{OUT_PATH}}",
  schema: "{{SCHEMA_PATH}}",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
