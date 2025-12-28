import { BarChart, LineChart, PieChart, RadarChart } from "echarts/charts";
import { GridComponent, LegendComponent, TooltipComponent } from "echarts/components";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";

use([BarChart, LineChart, CanvasRenderer, GridComponent, LegendComponent, PieChart, RadarChart, TooltipComponent]);

export function useCssVar(varName: string) {
	return getComputedStyle(document.documentElement)
		.getPropertyValue(varName)
		.trim();
}

export function useChartPalette() {
	const colors = [
		"--color-success",
		"--color-info",
		"--color-warning",
		"--color-error"
	];
	return colors.map((varName) => useCssVar(varName));
}
