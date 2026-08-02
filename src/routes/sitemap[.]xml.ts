import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { BRAND, BRAND_SLUG } from "@/lib/brand";

const BASE_URL = BRAND.siteUrl;

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const paths = ["/", "/fondateur", "/videos", "/books", "/auth"];

        try {
          const url = import.meta.env["VITE_SUPABASE_URL"] as string;
          const key = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string;
          if (url && key) {
            const client = createClient(url, key, { auth: { persistSession: false } });
            const { data } = await client.from("voitures").select("slug").eq("marque", BRAND_SLUG);
            for (const row of data ?? []) if (row.slug) paths.push(`/chassis/${row.slug}`);
          }
        } catch {
          // le sitemap reste valide avec les routes statiques
        }

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...paths.map((p) => `  <url>\n    <loc>${BASE_URL}${p}</loc>\n  </url>`),
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
