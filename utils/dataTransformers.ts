import { chartData } from '../constants/chart_data';

// Transforms nested monthly data into a flat array for Gifted Charts
export const getFlattenedChartData = () => {
  const flatData: { value: number; label: string }[] = [];
  
  (chartData as any).months.forEach((month: any) => {
    month.days.forEach((day: any) => {
      const date = new Date(day.date);
      // Format: 1 Jan
      const label = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
      flatData.push({
        value: day.energyGeneratedkWh,
        label: label,
      });
    });
  });
  return flatData;
};