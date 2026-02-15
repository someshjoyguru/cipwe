import type { MetadataRoute } from "next";
import { docs } from "@/lib/docs";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://cipwe.com";

  const staticPages: MetadataRoute.Sitemap = [
    "",
    "/docs",
    "/changelog",
    "/roadmap"
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7
  }));

  const docsPages: MetadataRoute.Sitemap = docs.map((doc) => ({
    url: `${baseUrl}/docs/${doc.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.65
  }));

  return [...staticPages, ...docsPages];
}
