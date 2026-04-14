import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/project-manager/",
        "/viewer/"
      ],
    },
    sitemap: "https://ontrack-web-gamma.vercel.app/sitemap.xml", 
  };
}