let scene = 1;

const svgWidth = 1200;
const svgHeight = 900;

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

function renderScene(s) {
  d3.select("#vis").html(""); // clear previous

  const svg = d3
    .select("#vis")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  if (s === 1) {
    svg.data("data/Scene1HomeAdvantage.csv").attr("width");

    // Scene 1: Overview
    svg
      .append("text")
      .attr("x", 50)
      .attr("y", 50)
      .text("Scene 1: Overview of the Data");

    svg
      .selectAll("circle")
      .data([10, 30, 50, 70])
      .enter()
      .append("circle")
      .attr("cx", (d) => d * 5)
      .attr("cy", 200)
      .attr("r", 10)
      .attr("fill", "steelblue");
  }
}

// Load first scene
renderScene(1);
