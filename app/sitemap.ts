import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://ontrack-web-gamma.vercel.app";
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, updated_at")
    .eq("live_status", "Live");

  const projectUrls = (projects || []).map((p) => ({
    url: `${baseUrl}/viewer/projects/${p.id}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  const staticUrls = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
  ];

  return [...staticUrls, ...projectUrls];
}