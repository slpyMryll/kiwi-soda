import { Project } from "@/types/projects"; 

export const MOCK_TRENDING_TOPICS = [
  {
    id: "1",
    title: "Protect Project Nature 2026",
    description: "A student-led initiative to reforest the upper campus areas.",
    tags: ["#Nature", "#Sustainability", "#VSU-SSC"],
    status: "Ongoing",
    progress: 67,
  },
  {
    id: "2",
    title: "Digital Student ID System",
    description: "Modernizing campus access by implementing an encrypted digital ID.",
    tags: ["#Digital", "#Tech", "#Security"],
    status: "Ongoing",
    progress: 45,
  }
];

export const HOW_IT_WORKS_STEPS = [
  { id: 1, label: "Submit a Proposal"},
  { id: 2, label: "Review & Approval" },
  { id: 3, label: "Track Progress"},
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    title: "Project Protect Nature 2026",
    description: "A comprehensive initiative to protect our campus flora...",
    location: "Upper Campus",
    postedAt: "2026-01-24T00:00:00.000Z",
    imageUrl: "/project-card-place.webp",
    tags: ["#Nature", "#Protect"],
    progress: 50,
    commentsCount: 99,
    isFollowing: false,
    status: "Ongoing",
    liveStatus: "Live",
    totalBudget: 50000,
    spentBudget: 12500,
    membersCount: 12,
    deadline: new Date("2026-05-30T00:00:00.000Z"),
    created_at: new Date(),
    updated_at: new Date(),
    milestones: [
      { id: "m1", title: "Proposed", dateString: "Jan 15, 2026", status: "Proposed" },
      { id: "m2", title: "Approved", dateString: "Jan 24, 2026", status: "Approved" },
      { id: "m3", title: "In Execution", dateString: "Jan 24 - Feb 15", status: "In Execution" },
      { id: "m4", title: "Completed", dateString: "Feb 15, 2026", status: "Pending" }
    ],
    budgetUpdates: [
      {
        id: "b1", date: "Jan 24, 2026", amountChange: 500, description: "Additional funding approved for enhanced stage setup", updatedBy: "Council Board", oldTotal: 4500, newTotal: 5000
      },
      {
        id: "b2", date: "Jan 20, 2026", amountChange: 500, description: "Additional funding approved for marketing materials", updatedBy: "Council Board", oldTotal: 4000, newTotal: 4500
      },
      {
        id: "b3", date: "Jan 15, 2026", amountChange: 4000, description: "Initial budget allocation", updatedBy: "Council Board", oldTotal: 0, newTotal: 4000, isInitial: true
      }
    ]
  },
  {
    id: "2",
    title: "Campus Wifi Expansion",
    description: "Expanding the coverage of the free student wifi across lower campus...",
    location: "Lower Campus",
    postedAt: "2026-01-24T00:00:00.000Z",
    imageUrl: "/project-card-place.webp",
    tags: ["#Tech", "#Connectivity"],
    progress: 34,
    commentsCount: 42,
    isFollowing: true,
    status: "Ongoing",
    liveStatus: "Live",
    totalBudget: 50000,
    spentBudget: 12500,
    membersCount: 12,
    deadline: new Date("2026-05-30T00:00:00.000Z"),
    created_at: new Date(),
    updated_at: new Date(),
    milestones: [
      { id: "m5", title: "Proposed", dateString: "Jan 10, 2026", status: "Proposed" },
      { id: "m6", title: "Approved", dateString: "Jan 20, 2026", status: "Approved" },
      { id: "m7", title: "In Execution", dateString: "Jan 24 - Present", status: "In Execution" },
      { id: "m8", title: "Completed", dateString: "May 30, 2026", status: "Pending" }
    ],
    budgetUpdates: [
      {
        id: "b4", date: "Jan 24, 2026", amountChange: 12500, description: "Initial procurement of routers and cables", updatedBy: "Finance Committee", oldTotal: 0, newTotal: 12500, isInitial: true
      }
    ]
  },
  {
    id: "3",
    title: "Digital ID System Implementation",
    description: "Successfully implemented the digital ID gates for the main entrance.",
    location: "Main Entrance",
    postedAt: "2025-10-10T00:00:00.000Z",
    imageUrl: "/project-card-place.webp",
    tags: ["#Security", "#Digital"],
    progress: 100,
    commentsCount: 156,
    isFollowing: false,
    status: "Completed",
    liveStatus: "Draft",
    totalBudget: 120000,
    spentBudget: 120000,
    membersCount: 8,
    deadline: new Date("2025-12-15T00:00:00.000Z"),
    created_at: new Date(),
    updated_at: new Date(),
    milestones: [
      { id: "m9", title: "Proposed", dateString: "Sep 01, 2025", status: "Proposed" },
      { id: "m10", title: "Approved", dateString: "Sep 15, 2025", status: "Approved" },
      { id: "m11", title: "In Execution", dateString: "Oct 10 - Dec 10", status: "Completed" },
      { id: "m12", title: "Completed", dateString: "Dec 15, 2025", status: "Completed" }
    ],
    budgetUpdates: [
      {
        id: "b5", date: "Dec 10, 2025", amountChange: 20000, description: "Final payment for software integration", updatedBy: "Tech Head", oldTotal: 100000, newTotal: 120000
      },
      {
        id: "b6", date: "Oct 10, 2025", amountChange: 100000, description: "Initial budget allocation and hardware purchase", updatedBy: "Council Board", oldTotal: 0, newTotal: 100000, isInitial: true
      }
    ]
  }
];