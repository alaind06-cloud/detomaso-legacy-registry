import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/fondateur")({
  server: {
    handlers: {
      GET: () =>
        new Response(null, {
          status: 301,
          headers: { Location: `${BRAND.siteUrl}/alejandro-de-tomaso` },
        }),
    },
  },
});
