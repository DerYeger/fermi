import { PieChart } from "echarts/charts";
import { LegendComponent, TitleComponent, TooltipComponent } from "echarts/components";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";

use([PieChart, TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

export function useChartPalette() {
	const get = (v: string) =>
		getComputedStyle(document.documentElement)
			.getPropertyValue(v)
			.trim();

	return [
		get("--color-success"),
		get("--color-info"),
		get("--color-warning"),
		get("--color-error")
	];
}
