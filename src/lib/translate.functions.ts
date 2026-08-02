import { createServerFn } from "@tanstack/react-start";

/**
 * Traduction automatique des historiques de châssis (FR -> EN/IT) via Lovable AI.
 */
export const translateHistory = createServerFn({ method: "POST" })
  .inputValidator((input: { text: string; target: "en" | "it" }) => {
    if (!input?.text || input.text.length > 20000) throw new Error("Texte invalide");
    if (input.target !== "en" && input.target !== "it") throw new Error("Langue invalide");
    return input;
  })
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("LOVABLE_API_KEY manquante");

    const target = data.target === "en" ? "English" : "Italian";
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash",
        messages: [
          {
            role: "system",
            content: `You translate classic-car registry chassis histories into ${target}. Keep proper nouns, chassis numbers, dates and formatting intact. Return only the translation.`,
          },
          { role: "user", content: data.text },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Traduction impossible [${res.status}]: ${body}`);
    }
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return { text: json.choices?.[0]?.message?.content ?? "" };
  });
