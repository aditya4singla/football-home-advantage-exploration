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

function renderScene(s) {
  d3.select('#vis').html(''); // clear previous

  const svg = d3.select('#vis').append('svg').attr('width', svgWidth).attr('height', svgHeight);

  if (s === 1) {
    const years = [2013, 2025];
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
    });
  }
}

// Load first scene
renderScene(1);
