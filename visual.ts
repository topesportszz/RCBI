import * as d3 from "d3";
import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;
import IVisual = powerbi.extensibility.IVisual;

export class RadarChart implements IVisual {
    private svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
    private container: d3.Selection<SVGGElement, unknown, HTMLElement, any>;

    constructor(options: powerbi.extensibility.visual.VisualConstructorOptions) {
        this.svg = d3.select(options.element)
            .append("svg")
            .classed("radarChart", true);
        
        this.container = this.svg.append("g");
    }

    public update(options: powerbi.extensibility.visual.VisualUpdateOptions): void {
        let dataView: DataView = options.dataViews[0];
        
        if (!dataView || !dataView.categorical || !dataView.categorical.values) {
            return;
        }
        
        const width = options.viewport.width;
        const height = options.viewport.height;
        this.svg.attr("width", width).attr("height", height);
        this.container.attr("transform", `translate(${width / 2}, ${height / 2})`);

        const categories = dataView.categorical.categories[0].values;
        const values = dataView.categorical.values.map(d => d.values.map(v => +v));
        const numAxes = categories.length;
        const radius = Math.min(width, height) / 2 - 20;
        
        const angleSlice = (2 * Math.PI) / numAxes;
        
        const scale = d3.scaleLinear()
            .domain([0, d3.max(values.flat())])
            .range([0, radius]);
        
        const line = d3.lineRadial()
            .radius(d => scale(d))
            .angle((d, i) => i * angleSlice);
        
        this.container.selectAll(".radar-path").remove();
        values.forEach((dataset, index) => {
            this.container.append("path")
                .datum(dataset)
                .attr("d", line)
                .attr("fill", d3.schemeCategory10[index % 10])
                .attr("fill-opacity", 0.3)
                .attr("stroke", d3.schemeCategory10[index % 10])
                .attr("stroke-width", 2);
        });
    }
}
