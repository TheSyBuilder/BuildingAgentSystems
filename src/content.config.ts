import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const modules = defineCollection({
  loader: glob({ base: "./src/content/modules", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number().int().positive(),
    status: z.enum(["draft", "review", "published"]),
    updated: z.coerce.date(),
  }),
});

export const collections = { modules };
