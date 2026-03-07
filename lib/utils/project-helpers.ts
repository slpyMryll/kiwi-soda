import { Project } from "@/types/projects";

interface FilterParams {
  status?: string;
  q?: string;
  sort?: string;
  date?: string;
}

export function getFilteredAndSortedProjects(projects: Project[], params: FilterParams): Project[] {
  const currentFilter = params.status || "all";
  const searchQuery = (params.q || "").toLowerCase();
  const sortOrder = params.sort || "newest";
  const dateFilter = params.date || "all";

  let processed = projects.filter((project) => {
    let matchesStatus = true;
    if (currentFilter === "ongoing") matchesStatus = project.status === "Active";
    if (currentFilter === "completed") matchesStatus = project.status === "Completed";
    
    let matchesSearch = true;
    if (searchQuery) {
      matchesSearch = 
        project.title.toLowerCase().includes(searchQuery) ||
        project.description.toLowerCase().includes(searchQuery);
    }

    let matchesDate = true;
    if (dateFilter === "this_month") {
      const projectDate = new Date(project.postedAt);
      const now = new Date();
      matchesDate = 
        projectDate.getMonth() === now.getMonth() &&
        projectDate.getFullYear() === now.getFullYear();
    }

    return matchesStatus && matchesSearch && matchesDate;
  });

  processed.sort((a, b) => {
    if (sortOrder === "a-z") {
      return a.title.localeCompare(b.title);
    } 
    if (sortOrder === "z-a") {
      return b.title.localeCompare(a.title);
    }

    const dateA = new Date(a.postedAt).getTime();
    const dateB = new Date(b.postedAt).getTime();
    
    if (sortOrder === "oldest") {
      return dateA - dateB; 
    } 
    
    return dateB - dateA; 
  });

  return processed;
}