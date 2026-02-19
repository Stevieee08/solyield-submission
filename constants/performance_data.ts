export interface PerformanceData {
  siteId: string;
  date: string;
  energyOutput: number;
  efficiency: number;
  temperature: number;
  irradiance: number;
  windSpeed: number;
  maintenanceScore: number;
}

export const performanceData = {
  underPerformingDays: 12,
  overPerformingDays: 8,
  normalDays: 15,
};
