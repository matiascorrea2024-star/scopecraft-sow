import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";
import { SOW_TEMPLATES } from "@/data/templates";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/templates`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  const templateRoutes: MetadataRoute.Sitemap = SOW_TEMPLATES.map((tpl) => ({
    url: `${SITE_URL}/templates/${tpl.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  return [...staticRoutes, ...templateRoutes];
}
