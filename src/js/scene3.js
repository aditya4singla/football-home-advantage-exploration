import { svgWidth, svgHeight, SVG_CUSHION } from './constants.js';

const DATA_PATH = './src/data/scene1/homeAdvantageYearly.csv';

const leagueNames = {
  E1: 'Premier League',
  SP1: 'La Liga',
  I1: 'Serie A',
  F1: 'Ligue 1',
  G1: 'Bundesliga',
};

const mean = (arr) => (arr && arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

const calculateMetrics = (leagueData) => {
  const averageGoalDiff = mean(leagueData.map((d) => d.avg_goal_diff));
  let lowest = leagueData[0];
  let highest = leagueData[0];
  leagueData.forEach((d) => {
    if (d.avg_goal_diff < lowest.avg_goal_diff) lowest = d;
    if (d.avg_goal_diff > highest.avg_goal_diff) highest = d;
  });
  return {
    averageGoalDiff,
    lowestGoalDiff: lowest.avg_goal_diff,
    lowestYear: lowest.Year,
    highestGoalDiff: highest.avg_goal_diff,
    highestYear: highest.Year,
  };
};

const drawAxes = ({ svg, x, y }) => {
  const xAxis = d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat('%Y'));
  const yAxis = d3.axisLeft(y).ticks(5).tickFormat(d3.format('.1f'));

  svg
    .append('g')
    .attr('transform', `translate(0, ${svgHeight - SVG_CUSHION})`)
    .call(xAxis);
  svg.append('g').attr('transform', `translate(${SVG_CUSHION}, 0)`).call(yAxis);

  svg
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -svgHeight / 2)
    .attr('y', SVG_CUSHION - 25)
    .attr('dy', '-1em')
    .style('text-anchor', 'middle')
    .style('font-size', '14px')
    .text('Home Goal Differential');

  svg
    .append('text')
    .attr('x', svgWidth / 2)
    .attr('y', svgHeight - SVG_CUSHION + 40)
    .style('text-anchor', 'middle')
    .style('font-size', '14px')
    .text('Year');
};

export const renderScene3 = () => {
  const fromSel = d3.select('#scene3-fromYear');
  const toSel = d3.select('#scene3-toYear');
  const leagueSel = d3.select('#scene3-leagueSelect');
  const updateBtn = d3.select('#scene3-updateBtn');
  const chartContainer = d3.select('#scene3-chart');
  const summaryContainer = d3.select('#scene3-summary');

  const years = d3.range(2008, 2025);
  fromSel
    .selectAll('option')
    .data(years)
    .join('option')
    .attr('value', (d) => d)
    .text((d) => d)
    .property('selected', (d) => d === 2018);
  toSel
    .selectAll('option')
    .data(years)
    .join('option')
    .attr('value', (d) => d)
    .text((d) => d)
    .property('selected', (d) => d === 2024);

  d3.csv(DATA_PATH).then((data) => {
    data.forEach((d) => {
      d.Year = +d.Year;
      d.avg_goal_diff = +d.avg_goal_diff;
      d.date = new Date(d.Year, 0, 1);
    });

    const updateChart = () => {
      const league = leagueSel.property('value');
      const fromYear = +fromSel.property('value');
      const toYear = +toSel.property('value');

      const zoomStart = new Date(fromYear, 0, 1);
      const zoomEnd = new Date(toYear, 11, 31);

      const leagueData = data
        .filter((d) => d.Division === league && d.Year >= fromYear && d.Year <= toYear)
        .sort((a, b) => a.Year - b.Year);
      chartContainer.html('');
      summaryContainer.html('');

      if (!leagueData.length) {
        chartContainer.html('<div>No data for selection</div>');
        return;
      }

      const metrics = calculateMetrics(leagueData);

      summaryContainer.html(`
        <div><strong>${leagueNames[league] || league}</strong></div>
        <div style="margin-top:6px;">
          Avg goal diff: ${metrics.averageGoalDiff != null ? metrics.averageGoalDiff.toFixed(2) : 'N/A'}<br/>
          Lowest: ${metrics.lowestGoalDiff.toFixed(2)} (${metrics.lowestYear})<br/>
          Highest: ${metrics.highestGoalDiff.toFixed(2)} (${metrics.highestYear})
        </div>
      `);

      // chart
      const svg = chartContainer.append('svg').attr('width', svgWidth).attr('height', svgHeight);

      const x = d3
        .scaleTime()
        .domain([zoomStart, zoomEnd])
        .range([SVG_CUSHION, svgWidth - SVG_CUSHION]);
      const y = d3
        .scaleLinear()
        .domain([0.05, 0.6])
        .range([svgHeight - SVG_CUSHION, SVG_CUSHION]);

      drawAxes({ svg, x, y });

      const covidStart = new Date(2020, 0, 1);
      const covidEnd = new Date(2022, 0, 1);
      svg
        .append('rect')
        .attr('x', x(covidStart))
        .attr('y', SVG_CUSHION)
        .attr('width', x(covidEnd) - x(covidStart))
        .attr('height', svgHeight - SVG_CUSHION * 2 - 10)
        .attr('fill', '#eee');

      svg
        .append('text')
        .attr('x', (x(covidStart) + x(covidEnd)) / 2)
        .attr('y', SVG_CUSHION - 8)
        .attr('text-anchor', 'middle')
        .attr('fill', 'red')
        .style('font-size', '12px')
        .style('font-weight', '600')
        .text('COVID-19 Pandemic');

      const line = d3
        .line()
        .x((d) => x(d.date))
        .y((d) => y(d.avg_goal_diff))
        .curve(d3.curveMonotoneX);
      svg
        .append('path')
        .datum(leagueData)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 2)
        .attr('d', line);

      svg
        .selectAll('circle')
        .data(leagueData)
        .join('circle')
        .attr('cx', (d) => x(d.date))
        .attr('cy', (d) => y(d.avg_goal_diff))
        .attr('r', 3)
        .attr('fill', 'steelblue');
    };

    updateBtn.on('click', updateChart);
    leagueSel.on('change', updateChart);
    fromSel.on('change', updateChart);
    toSel.on('change', updateChart);

    updateChart();
  });
};
