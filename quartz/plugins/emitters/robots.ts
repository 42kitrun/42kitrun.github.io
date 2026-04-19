import { QuartzEmitterPlugin } from "../types"
import { write } from "./helpers"
import { FullSlug } from "../../util/path"

export const Robots: QuartzEmitterPlugin = () => ({
  name: "Robots",
  async emit(ctx) {
    const baseUrl = ctx.cfg.configuration.baseUrl
    const sitemapUrl = baseUrl ? `https://${baseUrl}/sitemap.xml` : ""
    const content = [
      "User-agent: *",
      "Allow: /",
      "",
      ...(sitemapUrl ? [`Sitemap: ${sitemapUrl}`] : []),
    ].join("\n")

    const path = await write({
      ctx,
      content,
      slug: "robots" as FullSlug,
      ext: ".txt",
    })
    return [path]
  },
  async *partialEmit() {},
})
