// services/api.ts
// This file mimics a real backend service.
// In a real app, you would replace the "resolve" with "fetch('https://api...')"

// Updated Data for 2026
const MOCK_SITES = [
  {
    id: "site_01",
    name: "Bhadla Solar Park",
    location: { lat: 27.5362, lng: 71.9167 },
    capacity: "2245 MW"
  },
  {
    id: "site_02",
    name: "Pavagada Solar Park",
    location: { lat: 14.1666, lng: 77.4333 },
    capacity: "2050 MW"
  },
   {
    id: "site_03",
    name: "Kurnool Ultra Mega Solar Park",
    location: { lat: 15.6815, lng: 78.1516 },
    capacity: "1000 MW"
  }
];

const MOCK_SCHEDULE = [
    {
        id: "visit_101",
        siteId: "site_01",
        date: "2026-02-20", // UPDATED TO 2026
        time: "09:00 AM",
        title: "Quarterly Inspection"
    },
    {
        id: "visit_102",
        siteId: "site_02",
        date: "2026-02-21", // UPDATED TO 2026
        time: "02:00 PM",
        title: "Inverter Maintenance"
    }
];

// 1. Fetch All Visits (Simulates GET /visits)
export const fetchVisits = async () => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_SCHEDULE), 500); // Simulate network delay
    });
};

// 2. Fetch Single Visit (Simulates GET /visits/:id)
export const fetchVisitById = async (id: string) => {
    return new Promise((resolve, reject) => {
        const visit = MOCK_SCHEDULE.find(v => v.id === id);
        if (visit) resolve(visit);
        else reject(new Error("Visit not found"));
    });
};

// 3. Fetch Site Details (Simulates GET /sites/:id)
export const fetchSiteById = async (siteId: string) => {
    return new Promise((resolve) => {
        const site = MOCK_SITES.find(s => s.id === siteId);
        resolve(site);
    });
};