import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/viewer/projects/*"
      ],
      disallow: [
        "/admin/",
        "/project-manager/",
        "/viewer/following",
        "/viewer/transparency",
        "/onboarding",
        "/auth/"
      ],
    },
    sitemap: "https://ontrack-web-gamma.vercel.app/sitemap.xml", 
  };
}