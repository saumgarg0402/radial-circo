import { Component } from '@angular/core';
import * as d3 from 'd3';
import * as d3Radial from 'd3-scale-radial';
import * as Circos from 'circos'; 

import { raddata } from '../assets/data';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

	private width : number;
	private height : number;
	private innerRadius : number;
	private outerRadius : any;
	private x : any;
	private y : any;
	private z : any;
	private circos : any;
	private configuration: any;
	private circodata: any;

	private svg : any;

	ngOnInit(){

		this.configuration = {
		  innerRadius: 250,
		  outerRadius: 300,
		  cornerRadius: 10,
		  gap: 0.04, // in radian
		  labels: {
		    display: true,
		    position: 'center',
		    size: '14px',
		    color: '#000000',
		    radialOffset: 20,
		  },
		  ticks: {
		    display: false,
		    color: 'grey',
		    spacing: 10000000,
		    labels: true,
		    labelSpacing: 10,
		    labelSuffix: 'Mb',
		    labelDenominator: 1000000,
		    labelDisplay0: true,
		    labelSize: '10px',
		    labelColor: '#000000',
		    labelFont: 'default',
		    majorSpacing: 5,
		    size: {
		      minor: 2,
		      major: 5,
		    }
		  },
		  events: {}
		};
		this.circodata = [
		  { len: 20, color: "#8dd3c7", label: "Alert1", id: "Alert1" },
		  { len: 40, color: "#ffffb3", label: "Alert2", id: "Alert2" },
		  { len: 60, color: "#bebada", label: "Alert3", id: "Alert3" },
		];
		this.setup();
		this.buildSvg();
		this.createChart(raddata);
		
	}

	setup(){

		this.width = 300
		this.height = 300;
		this.innerRadius=120;
		this.outerRadius=Math.min(this.width, this.height) * 0.67;
		this.x=d3.scaleBand()
				    .range([0, 2 * Math.PI])
				    .align(0);
		
		this.y=d3Radial.scaleRadial().range([this.innerRadius, this.outerRadius]);

		this.z=d3.scaleOrdinal()
    				.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
	}

	buildSvg(){
		this.svg = d3.select("#chart").append("svg")
				    .attr("width", 1000)
				    .attr("height", 1000)
				    .append("g")
				    .attr("transform", "translate(500,500)");
		this.circos = new Circos({
						    container: '#circoChart',
						    width: 1000,
						    height: 1000,
						});
		this.circos.layout(this.circodata, this.configuration);
		this.circos.render();

	}

	createChart(data:any){

		var columns=[];
		for(var key in data[0]){
			columns.push(key);
		}

		// data.sort(function(a, b) { 
		// 	return a[columns[6]] -  b[columns[6]]; 
		// });
		this.x.domain(data.map( (d) =>  { return d.State; }));
		this.y.domain([0, d3.max(data, (d:any) => { return d.total; })]);
		this.z.domain(columns.slice(1));

		console.log(d3.stack().keys(columns.slice(1))(data));

		this.svg.append("g")
		    .selectAll("g")
		    .data(d3.stack().keys(columns.slice(1))(data))
		    .enter().append("g")
		      .attr("fill", (d) => { return this.z(d.key); })
		    .selectAll("path")
		    .data((d) => { return d; })
		    .enter().append("path")
		      .attr("d", d3.arc()
		          .innerRadius((d) => { return this.y(d[0]); })
		          .outerRadius((d) => { return this.y(d[1]); })
		          .startAngle((d:any) => { return this.x(d.data.State); })
		          .endAngle((d:any) => { return this.x(d.data.State) + this.x.bandwidth(); })
		          .padAngle(0.01)
		          .padRadius(this.innerRadius));

		
		let yAxis = this.svg.append("g")
								.attr("text-anchor","end");

		let yTick = yAxis
					    .selectAll("g")
					    .data(this.y.ticks(10).slice(1))
					    .enter().append("g");
		yTick.append("circle")
		      .attr("fill", "none")
		      .attr("stroke", "#000")
		      .attr("stroke-opacity", 0.5)
		      .attr("r", this.y);

	  	yTick.append("text")
		      .attr("x", -6)
		      .attr("y", (d) => { return -this.y(d); })
		      .attr("dy", "0.35em")
		      .attr("fill", "none")
		      .attr("stroke", "#fff")
		      .attr("stroke-width", 5)
		      .text(this.y.tickFormat(10, "s"));

	  	yTick.append("text")
		      .attr("x", -6)
		      .attr("y", (d) => { return -this.y(d); })
		      .attr("dy", "0.35em")
		      .text(this.y.tickFormat(10, "s"));


	}
}
