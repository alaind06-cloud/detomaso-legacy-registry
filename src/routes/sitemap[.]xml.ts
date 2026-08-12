import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { BRAND_SLUG } from "@/lib/brand";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/integrations/supabase/client";

const BASE_URL = "https://www.registerdetomaso.com";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/fondateur", changefreq: "monthly", priority: "0.8" },
          { path: "/videos", changefreq: "weekly", priority: "0.6" },
          { path: "/books", changefreq: "monthly", priority: "0.6" },
          { path: "/auth", changefreq: "yearly", priority: "0.3" },
        ];

        try {
          const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: { persistSession: false },
          });
          const { data } = await client
            .from("voitures")
            .select("slug")
            .eq("marque", BRAND_SLUG);

          for (const row of data ?? []) {
            if (row.slug) {
              entries.push({
                path: `/chassis/${encodeURIComponent(row.slug)}`,
                changefreq: "monthly",
                priority: "0.9",
              });
            }
          }
        } catch {
          // le sitemap reste valide avec les routes statiques
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
