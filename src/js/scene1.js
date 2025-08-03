import { svgWidth, svgHeight, SVG_CUSHION } from './constants.js';

// Steps:
// 1. Show the goal differential from 2000 to 2020
// 2. Pause at 2020 and annotate saying Covid disrupted the season
// 3. Show the goal differential drop steply from 2020 to 2022
// 4. Show the goal differential rise again from 2022 to 2025

const DATA_PATH = './src/data/scene1/globalHalfYear.csv';

const updateCommentary = (text) => {
  d3.select('#scene1-commentary').text(text).transition().duration(300);
};

const drawAxes = ({ svg, x, y }) => {
  const xAxis = d3
    .axisBottom(x)
    .tickValues([
      new Date(2010, 0, 1),
      new Date(2015, 0, 1),
      new Date(2020, 0, 1),
      new Date(2022, 0, 1),
      new Date(2025, 2, 1),
    ])
    .tickFormat(d3.timeFormat('%Y'));
  let yAxis = d3.axisLeft(y).ticks(5).tickFormat(d3.format('.1f'));

  svg
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${svgHeight - SVG_CUSHION})`)
    .call(xAxis);

  svg.append('g').attr('class', 'y-axis').attr('transform', `translate(${SVG_CUSHION}, 0)`).call(yAxis);
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
    .attr('y', svgHeight - SVG_CUSHION + 50)
    .style('text-anchor', 'middle')
    .style('font-size', '14px')
    .text('Year');
};

export const renderScene1 = () => {
  const svg = d3.select('#scene1-chart').append('svg').attr('width', svgWidth).attr('height', svgHeight);
  const goalDifferential = [0.05, 0.55];

  d3.csv(DATA_PATH).then((data) => {
    data.forEach((d) => {
      d.date = new Date(d.Date);
    });

    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date))
      .range([SVG_CUSHION, svgWidth - SVG_CUSHION]);

    const y = d3
      .scaleLinear()
      .domain(goalDifferential)
      .range([svgHeight - SVG_CUSHION, SVG_CUSHION]);

    drawAxes({ svg, x, y });

    const line = d3
      .line()
      .x((d) => x(d.date))
      .y((d) => y(d.avg_goal_diff))
      .curve(d3.curveMonotoneX);

    const container = svg.append('g');

    const preCovidData = data.filter((d) => d.date <= new Date(2019, 9, 1));
    const duringCovidData = data.filter((d) => d.date >= new Date(2019, 3, 1) && d.date <= new Date(2021, 3, 1));
    const postCovidData = data.filter((d) => d.date >= new Date(2021, 1, 1));

    const stadiumsClosedAnnotation = {
      x: x(preCovidData[preCovidData.length - 1].date),
      y: y(preCovidData[preCovidData.length - 1].avg_goal_diff),
    };

    const stadiumsReopenedAnnotation = {
      x: x(duringCovidData[duringCovidData.length - 1].date),
      y: y(duringCovidData[duringCovidData.length - 1].avg_goal_diff),
    };

    const finalAnnotation = {
      x: x(postCovidData[postCovidData.length - 1].date),
      y: y(postCovidData[postCovidData.length - 1].avg_goal_diff),
    };

    const preCovidPath = container
      .append('path')
      .datum(preCovidData)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 3)
      .attr('d', line);

    const duringCovidPath = container
      .append('path')
      .datum(duringCovidData)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 3)
      .attr('d', line);

    const postCovidPath = container
      .append('path')
      .datum(postCovidData)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 3)
      .attr('d', line);

    updateCommentary(
      'Here we can see that the average home goal differential in football has been around 0.5 goals per game. This shows a clear home advantage...',
    );

    // Animating the line. Source: https://medium.com/@louisemoxy/create-a-d3-line-chart-animation-336f1cb7dd61
    let totalLength = preCovidPath.node().getTotalLength();
    preCovidPath
      .attr('stroke-dasharray', totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(10000)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0)
      .on('end', () => {
        svg
          .append('circle')
          .attr('cx', stadiumsClosedAnnotation.x)
          .attr('cy', stadiumsClosedAnnotation.y)
          .attr('r', 4)
          .attr('fill', 'red');

        svg
          .append('text')
          .attr('x', stadiumsClosedAnnotation.x + 10)
          .attr('y', stadiumsClosedAnnotation.y)
          .text('COVID hits: Stadiums closed to public')
          .attr('fill', 'red')
          .style('font-size', '12px')
          .style('font-weight', 'bold');

        updateCommentary('Suddenly COVID hits, stadiums are closed, and we see a sharp decline in this advantage');
      });

    totalLength = duringCovidPath.node().getTotalLength();
    duringCovidPath
      .attr('stroke-dasharray', totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .delay(13000)
      .duration(6000)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0)
      .on('end', () => {
        svg
          .append('circle')
          .attr('cx', stadiumsReopenedAnnotation.x)
          .attr('cy', stadiumsReopenedAnnotation.y)
          .attr('r', 4)
          .attr('fill', 'green');
        svg
          .append('text')
          .attr('x', stadiumsReopenedAnnotation.x + 10)
          .attr('y', stadiumsReopenedAnnotation.y)
          .text('Stadiums reopened')
          .attr('fill', 'green')
          .style('font-size', '12px')
          .style('font-weight', 'bold');

        updateCommentary('As stadiums reopened, we see a gradual return to the pre-COVID home advantage levels.');
      });

    totalLength = postCovidPath.node().getTotalLength();
    postCovidPath
      .attr('stroke-dasharray', totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .delay(19000)
      .duration(7000)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0)
      .on('end', () => {
        svg
          .append('circle')
          .attr('cx', finalAnnotation.x)
          .attr('cy', finalAnnotation.y)
          .attr('r', 4)
          .attr('fill', 'orange');
        svg
          .append('text')
          .attr('x', finalAnnotation.x + 10)
          .attr('y', finalAnnotation.y)
          .text('Now')
          .attr('fill', 'orange')
          .style('font-size', '12px')
          .style('font-weight', 'bold');

        updateCommentary(
          "It's clear that home advantage is trending upwards again, but will it ever return to pre-COVID levels?",
        );

        document.getElementById('next-btn').disabled = false;
      });
  });
};
