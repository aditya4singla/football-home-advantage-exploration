import { svgWidth, svgHeight, SVG_CUSHION } from './constants.js';

// Steps:
// 1. Show the goal differential from 2000 to 2020
// 2. Pause at 2020 and annotate saying Covid disrupted the season
// 3. Show the goal differential drop steply from 2020 to 2022
// 4. Show the goal differential rise again from 2022 to 2025

const stepSequence = [
  { start: 2008, end: 2020, duration: 7000, animate: true },
  { start: 2020, end: 2021, duration: 3000, animate: false }, // pause at 2020
  { start: 2020, end: 2022, duration: 10000 },
  { start: 2022, end: 2025, duration: 7000 },
];

const state = {
  currentYear: 2000,
  step: 1,
};

const colorPalette = d3.scaleOrdinal(d3.schemeObservable10);

const DATA_PATH = './src/data/scene1/homeAdvantageYearly.csv';

const mapDivisionToReadableName = (division) => {
  switch (division) {
    case 'E1':
      return 'Premier League';
    case 'SP1':
      return 'La Liga';
    case 'I1':
      return 'Serie A';
    case 'F1':
      return 'Ligue 1';
    case 'G1':
      return 'Bundesliga';
    default:
      return 'Unknown Division';
  }
};

// Splits data into: pre-covid, during-covid, and post-covid
const formatData = (data, years) => {
  const startYear = years[0];
  const endYear = years[1];

  const filteredData = data.filter((d) => d.Year >= startYear && d.Year <= endYear);

  const nested = d3.group(filteredData, (d) => d.Division);

  return { filteredData, nested };
};

const drawLegend = (svg, divisions) => {
  const legend = svg
    .append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${svgWidth - 150}, ${SVG_CUSHION})`);

  divisions.forEach((division, i) => {
    const label = mapDivisionToReadableName(division);

    const legendItem = legend.append('g').attr('transform', `translate(0, ${i * 20})`);

    legendItem.append('rect').attr('width', 12).attr('height', 12).attr('fill', colorPalette(division));

    legendItem
      .append('text')
      .attr('x', 20)
      .attr('y', 10)
      .text(label)
      .style('font-size', '12px')
      .attr('alignment-baseline', 'middle');
  });
};

const drawAxes = ({ svg, x, y }) => {
  let xAxis = d3.axisBottom(x).tickValues([2010, 2015, 2020, 2022, 2025]).tickFormat(d3.format('d'));
  let yAxis = d3.axisLeft(y).ticks(5).tickFormat(d3.format('.1f'));

  svg
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${svgHeight - SVG_CUSHION})`)
    .call(xAxis);

  svg.append('g').attr('class', 'y-axis').attr('transform', `translate(${SVG_CUSHION}, 0)`).call(yAxis);
};

export const renderScene1 = () => {
  const svg = d3.select('#vis').append('svg').attr('width', svgWidth).attr('height', svgHeight);
  const container = svg.append('g');
  const years = [2007, 2025];
  const goalDifferential = [0, 0.8];
  const x = d3
    .scaleLinear()
    .domain(years)
    .range([SVG_CUSHION, svgWidth - SVG_CUSHION]);
  const y = d3
    .scaleLinear()
    .domain(goalDifferential)
    .range([svgHeight - SVG_CUSHION, SVG_CUSHION]);
  drawAxes({ svg, x, y });

  d3.csv(DATA_PATH).then((data) => {
    data.forEach((d) => {
      if (d.avg_goal_diff < 0) {
        console.warn('Negative goal diff:', d);
      }
    });

    const line = d3
      .line()
      .x((d) => x(d.Year))
      .y((d) => y(d.avg_goal_diff))
      .curve(d3.curveMonotoneX);

    const divisionGroup = container.append('g').attr('class', 'division-lines');
    const divisionPaths = new Map();

    state.currentYear = state.currentYear + 1;
    const { filteredData, nested } = formatData(data, years);

    drawLegend(svg, Array.from(nested.keys()));

    divisionGroup.selectAll('path').remove();

    for (const [division, vals] of nested) {
      const sorted = vals.sort((a, b) => a.Year - b.Year);
      const path = divisionGroup
        .append('path')
        .datum(sorted)
        .attr('fill', 'none')
        .attr('stroke', colorPalette(division))
        .attr('stroke-width', 2)
        .attr('d', line);

      // Animating the line. Source: https://medium.com/@louisemoxy/create-a-d3-line-chart-animation-336f1cb7dd61
      const totalLength = path.node().getTotalLength();
      path
        .attr('stroke-dasharray', totalLength)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(10000)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0);

      divisionPaths.set(division, { path, data: sorted });
    }
  });
};
