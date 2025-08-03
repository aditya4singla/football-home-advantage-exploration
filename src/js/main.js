import { renderScene1 } from './scene1.js';

let scene = 1;

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
  d3.select('#vis').html(''); // clear previous

  d3.select('#scene1').style('display', 'none');
  d3.select('#scene2').style('display', 'none');
  d3.select('#scene3').style('display', 'none');

  if (s === 1) {
    d3.select('#scene1').style('display', 'block');
    renderScene1();
  }
}

function main() {
  renderScene(1);
  d3.select('button.next').on('click', nextScene);
  d3.select('button.prev').on('click', prevScene);
}

main();
