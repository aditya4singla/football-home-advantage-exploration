import { svgWidth, svgHeight, SVG_CUSHION } from './constants';

// Steps:
// 1. Show the goal differential from 2000 to 2020
// 2. Pause at 2020 and annotate saying Covid disrupted the season
// 3. Show the goal differential drop steply from 2020 to 2022
// 4. Show the goal differential rise again from 2022 to 2025

const stepSequence = [
  { start: 2000, end: 2020, duration: 7000, animate: true },
  { start: 2020, end: 2020, duration: 3000, animate: false }, // pause at 2020
  { start: 2020, end: 2022, duration: 10000 },
  { start: 2022, end: 2025, duration: 7000 },
];

const state = {
  currentYear: 2000,
  step: 1,
};

const colorPalette = d3.scaleOrdinal(d3.schemeObservable10);

const DATA_PATH = 'data/Scene1HomeAdvantage.csv';

const mapDivisionToReadableName = (division) => {
  switch (division) {
    case 'E1':
      return 'Premier League';
    case 'S1':
      return 'La Liga';
    case 'I1':
      return 'Serie A';
    case 'F1':
      return 'Ligue 1';
    case 'B1':
      return 'Bundesliga';
    default:
      return 'Unknown Division';
  }
};

const togglePlayForScene1 = (shouldPlay) => {
  if (shouldPlay) {
    state.playing = true;

    // Logic to start playing scene 1
    console.log('Playing Scene 1');
  } else {
    // Logic to pause scene 1
    state.playing = false;
    console.log('Pausing Scene 1');
  }
};

const getVariableDataForScene1 = (data) => {
  // 1. Let us filter the data till currentYear

  // filteredData = data.filter((d) => d.Year <= Math.floor(state.currentYear));
  filteredData = data;

  const nested = d3.group(filteredData, (d) => d.Division);

  return { filteredData, nested };
};

const drawAxes = (svg) => {
  const years = [2000, 2025];
  const goalDifferential = [0, 0.8];

  const x = d3
    .scaleLinear()
    .domain(years)
    .range([SVG_CUSHION, svgWidth - SVG_CUSHION]);
  let xAxis = d3.axisBottom(x).ticks(12).tickFormat(d3.format('d'));

  const y = d3
    .scaleLinear()
    .domain(goalDifferential)
    .range([svgHeight - SVG_CUSHION, SVG_CUSHION]);
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
  const container = svg.append('g').attr('transform', `translate(${50},${50})`);

  drawAxes(svg);

  d3.csv(DATA_PATH).then((data) => {
    const line = d3
      .line()
      .x((d) => x(d.Year))
      .y((d) => y(d.avg_goal_diff))
      .curve(d3.curveMonotoneX);

    // container for division lines
    const divisionGroup = container.append('g').attr('class', 'division-lines');
    const divisionPaths = new Map();

    state.currentYear = state.currentYear + 1;
    const { filteredData, nested } = getVariableDataForScene1(data);

    divisionGroup.selectAll('path').remove();

    for (const [division, vals] of nested) {
      const sorted = vals.sort((a, b) => a.Year - b.Year);
      const path = divisionGroup
        .append('path')
        .datum(sorted)
        .attr('fill', 'none')
        .attr('stroke', colorPalette)
        .attr('stroke-width', 2)
        .attr('d', line);

      const totalLength = path.node().getTotalLength();
      path
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(10000)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0);

      divisionPaths.set(division, { path, data: sorted });
    }
  });
};
