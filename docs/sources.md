# Source ledger

Technical claims and integration choices are verified against primary documentation.

| Area | Verified claim | Primary source | Verified |
|---|---|---|---|
| Astro integrations | Astro supports maintained React and MDX integrations through its integration configuration. | https://docs.astro.build/en/guides/integrations/ | verified: 2026-07-24 |
| Tailwind | Astro 5.2 and later supports Tailwind CSS 4 through the Tailwind Vite plugin. | https://docs.astro.build/en/guides/styling/#tailwind | verified: 2026-07-24 |
| Content collections | Local Markdown and MDX content can be loaded into a build-time collection with Astro's glob loader. | https://docs.astro.build/en/guides/content-collections/ | verified: 2026-07-24 |
| Motion | Motion for React is installed from the `motion` package and imported from `motion/react`. | https://motion.dev/docs/react-installation | verified: 2026-07-24 |
| Agent architecture | Workflows follow predefined code paths; agents let models dynamically direct processes and tool use, and should use environmental feedback and stopping conditions. | https://www.anthropic.com/engineering/building-effective-agents | verified: 2026-08-03 |
| Agent boundary | An LLM application is not an agent unless the model controls workflow execution; agents select tools from current state within defined guardrails and can stop or hand control back. | https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf | verified: 2026-08-03 |
| Human-led assistance | Copilot guidance keeps people responsible for reviewing, validating, and approving consequential work, and recommends human-led ownership for high-risk or judgment-heavy decisions. | https://support.microsoft.com/en-us/Microsoft-365-Copilot/decide-when-copilot-or-an-agent-is-the-right-tool-for-your-work | verified: 2026-08-03 |
| Static hosting | A Cloudflare Worker can serve a bundled static site through its `ASSETS` binding, whose `fetch()` method applies the configured HTML and not-found handling. | https://developers.cloudflare.com/workers/static-assets/binding/ | verified: 2026-07-31 |
