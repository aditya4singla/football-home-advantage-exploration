let scene = 1;

const svgWidth = 900;
const svgHeight = 600;

const SVG_CUSHION = 50;

function nextScene() {
  scene++;
  renderScene(scene);
}

function prevScene() {
  if (scene > 1) {
    scene--;
    renderScene(scene);
  }
}

const currentState = {
  currentYear: 2000,
  playing: false,
};

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
    currentState.playing = true;

    // Logic to start playing scene 1
    console.log('Playing Scene 1');
  } else {
    // Logic to pause scene 1
    currentState.playing = false;
    console.log('Pausing Scene 1');
  }
};

const getVariableDataForScene1 = (data) => {
  // 1. Let us filter the data till currentYear

  filteredData = data.filter((d) => d.Year <= currentState.currentYear);

  console.log(`Filtered Data for Year ${currentState.currentYear}:`, filteredData);

  const nested = d3.group(filteredData, (d) => d.Division);

  return { filteredData, nested };
};

function renderScene(s) {
  d3.select('#vis').html(''); // clear previous
  const svg = d3.select('#vis').append('svg').attr('width', svgWidth).attr('height', svgHeight);
  const container = svg.append('g').attr('transform', `translate(${50},${50})`);

  if (s === 1) {
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

    d3.csv('data/Scene1HomeAdvantage.csv').then((data) => {
      console.log(data);

      const line = d3
        .line()
        .x((d) => x(d.Year))
        .y((d) => y(d.avg_goal_diff))
        .curve(d3.curveMonotoneX);

      // container for division lines
      const divisionGroup = container.append('g').attr('class', 'division-lines');
      const divisionPaths = new Map();

      setInterval(() => {
        if (currentState.playing) {
          currentState.currentYear = currentState.currentYear + 1;
          const { filteredData, nested } = getVariableDataForScene1(data);

          for (const [division, vals] of nested) {
            const sorted = vals.sort((a, b) => a.Year - b.Year);
            const path = divisionGroup
              .append('path')
              .datum(sorted)
              .attr('fill', 'none')
              .attr('stroke', 'red')
              .attr('stroke-width', 2)
              .attr('d', line)
              .attr('opacity', 1);
            divisionPaths.set(division, { path, data: sorted });
          }
        }
      }, 100);

      // progressive reveal
      Array.from(divisionPaths.entries()).forEach(([division, { path }], i) => {
        path
          .transition()
          .delay(400 + i * 300)
          .duration(800)
          .attr('opacity', 1);
      });
    });
  }
}

// Load first scene
renderScene(1);
