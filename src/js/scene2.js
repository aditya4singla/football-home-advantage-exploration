import { svgWidth, svgHeight, SVG_CUSHION } from './constants.js';

const DATA_PATH = './src/data/scene1/homeAdvantageYearly.csv';

const mapDivisionToReadableName = (division) => {
  switch (division) {
    case 'E1':
      return 'Premier League';
    case 'G1':
      return 'Bundesliga';
    default:
      return 'Unknown Division';
  }
};

const drawLegend = (svg) => {
  const legend = svg.append('g').attr('transform', `translate(${svgWidth - 220}, ${SVG_CUSHION})`);
  const items = [
    { label: `Premier League`, color: 'green' },
    { label: `Bundesliga`, color: 'red' },
  ];
  items.forEach((it, i) => {
    const g = legend.append('g').attr('transform', `translate(0, ${i * 18})`);
    g.append('rect').attr('width', 12).attr('height', 12).attr('fill', it.color);
    g.append('text')
      .attr('x', 18)
      .attr('y', 10)
      .text(it.label)
      .style('font-size', '12px')
      .attr('alignment-baseline', 'middle');
  });
};

const drawAxes = ({ svg, x, y }) => {
  const xAxis = d3
    .axisBottom(x)
    .tickValues([2018, 2020, 2022, 2025].map((y) => new Date(y, 0, 1)))
    .tickFormat(d3.timeFormat('%Y'));
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

const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

const calculateBaseline = (data) => {
  return mean(data.filter((d) => d.Year === 2018 || d.Year === 2019).map((d) => d.avg_goal_diff));
};

const updateCommentary = (text) => {
  d3.select('#scene2-commentary').text(text);
};

export const renderScene2 = () => {
  const svg = d3.select('#scene2-chart').append('svg').attr('width', svgWidth).attr('height', svgHeight);
  const zoomStart = new Date(2018, 0, 1);
  const zoomEnd = new Date(2025, 11, 31);

  d3.csv(DATA_PATH).then((data) => {
    data.forEach((d) => {
      d.Year = +d.Year;
      d.avg_goal_diff = +d.avg_goal_diff;
      d.date = new Date(d.Year, 0, 1);
    });

    const filtered = data.filter((d) => d.date >= zoomStart && d.date <= zoomEnd);

    const premierLeague = 'E1';
    const bundesliga = 'G1';
    const premierLeagueData = filtered.filter((d) => d.Division === premierLeague);
    const bundesligaData = filtered.filter((d) => d.Division === bundesliga);

    const premierLeagueBaseline = calculateBaseline(premierLeagueData);
    const bundesligaBaseline = calculateBaseline(bundesligaData);

    const x = d3
      .scaleTime()
      .domain([zoomStart, zoomEnd])
      .range([SVG_CUSHION, svgWidth - SVG_CUSHION]);
    const y = d3
      .scaleLinear()
      .domain([0.05, 0.6])
      .range([svgHeight - SVG_CUSHION, SVG_CUSHION]);

    drawAxes({ svg, x, y });
    drawLegend(svg);

    updateCommentary(
      `The Premier League and Bundesliga have shown different trends in home goal differential since 2018.`,
    );

    d3.timeout(() => {
      updateCommentary(
        'While Bundesliga used to have the strongest home advantage, it now has the weakest. The Premier League, on the other hand, has maintained a strong home advantage throughout this period.',
      );
    }, 5000);

    d3.timeout(() => {
      updateCommentary('So it seems the change to home stadium advantage has not been uniform across leagues.');
    }, 10000);

    svg
      .append('line')
      .attr('x1', x(zoomStart))
      .attr('x2', x(zoomEnd))
      .attr('y1', y(premierLeagueBaseline))
      .attr('y2', y(premierLeagueBaseline))
      .attr('stroke', 'green')
      .attr('stroke-dasharray', '4 4')
      .attr('stroke-width', 1);

    svg
      .append('text')
      .attr('x', x(zoomEnd))
      .attr('y', y(premierLeagueBaseline) - 5)
      .attr('text-anchor', 'end')
      .attr('fill', 'green')
      .style('font-size', '12px')
      .text('Premier League pre-COVID baseline');

    svg
      .append('line')
      .attr('x1', x(zoomStart))
      .attr('x2', x(zoomEnd))
      .attr('y1', y(bundesligaBaseline))
      .attr('y2', y(bundesligaBaseline))
      .attr('stroke', 'red')
      .attr('stroke-dasharray', '4 4')
      .attr('stroke-width', 1);

    svg
      .append('text')
      .attr('x', x(zoomEnd))
      .attr('y', y(bundesligaBaseline) - 5)
      .attr('text-anchor', 'end')
      .attr('fill', 'red')
      .style('font-size', '12px')
      .text('Bundesliga pre-COVID baseline');

    // line generator
    const line = d3
      .line()
      .x((d) => x(d.date))
      .y((d) => y(d.avg_goal_diff))
      .curve(d3.curveMonotoneX);

    const container = svg.append('g');

    // draw the two league lines
    const premierLeaguePath = container
      .append('path')
      .datum(premierLeagueData)
      .attr('fill', 'none')
      .attr('stroke', 'green')
      .attr('stroke-width', 3)
      .attr('d', line);

    let totalLength = premierLeaguePath.node().getTotalLength();
    premierLeaguePath
      .attr('stroke-dasharray', totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(8000)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0);

    const bundesligaPath = container
      .append('path')
      .datum(bundesligaData)
      .attr('fill', 'none')
      .attr('stroke', 'red')
      .attr('stroke-width', 3)
      .attr('d', line);

    totalLength = bundesligaPath.node().getTotalLength();
    bundesligaPath
      .attr('stroke-dasharray', totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(8000)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0);
  });
};
