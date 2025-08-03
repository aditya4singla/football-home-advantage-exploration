import { renderScene1 } from './scene1.js';

let scene = 0;

function nextScene() {
  scene++;
  renderScene(scene);
}

function prevScene() {
  if (scene > 0) {
    scene--;
    renderScene(scene);
  }
}

function renderScene(s) {
  d3.select('#next-btn').style('display', 'none');
  d3.select('#prev-btn').style('display', 'none');
  d3.select('#intro').style('display', 'none');
  d3.select('#scene1').style('display', 'none');
  d3.select('#scene1-chart').select('svg').remove();
  d3.select('#scene2').style('display', 'none');
  d3.select('#scene3').style('display', 'none');

  if (s === 0) {
    d3.select('#intro').style('display', 'flex');
  } else if (s === 1) {
    d3.select('#scene1').style('display', 'block');
    d3.select('#next-btn').style('display', 'block');
    d3.select('#prev-btn').style('display', 'block');
    renderScene1();
  }
}

function main() {
  renderScene(scene);
  document.getElementById('start-btn').addEventListener('click', () => {
    nextScene();
  });
  document.getElementById('next-btn').addEventListener('click', () => {
    nextScene();
  });
  document.getElementById('prev-btn').addEventListener('click', () => {
    prevScene();
  });
}

main();
