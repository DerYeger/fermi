import { BarChart, LineChart, PieChart, RadarChart } from "echarts/charts";
import { DataZoomComponent, GridComponent, LegendComponent, TooltipComponent, VisualMapComponent } from "echarts/components";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";

use([
	BarChart,
	LineChart,
	CanvasRenderer,
	DataZoomComponent,
	GridComponent,
	LegendComponent,
	PieChart,
	RadarChart,
	TooltipComponent,
	VisualMapComponent
]);

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

export function useChartShadows() {
	const color = useColorMode();
	return computed(() => {
		const shadowColor
			= color.value === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.3)";
		return {
			shadowBlur: 10,
			shadowColor
		};
	});
}

export function createVisualMap(min: number | undefined, max: number | undefined) {
	if (min === undefined || max === undefined || min === max) {
		return undefined;
	}
	return {
		show: false,
		min,
		max,
		inRange: {
			colorLightness: [0.4, 0.75]
		}
	};
}
