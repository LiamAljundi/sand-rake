// Hi Peter!
// We were inspired by the particles tutorial, the drawing tutorial and
// 30,000 particles from: https://codepen.io/soulwire/pen/Ffvlo

//Setup canvas
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

//Definition of variables
let particles = []; //array for particles (this is where particles are saved between frames)
let distance = 6; //distance between particles
let columns;
let rows;
let resizeTimer; //timer to delay resize events (so it doesn't resize too often)
let mouseX; //current mouseX position in relation to canvas
let mouseY; // same but for Y coordinates
let color = [45, 100, 65]; //hsl color code for particles and background
let rakeSize = 4; //line/stroke size of rake
let isMouseDown = false;
const rakes ={ //object with all the rake arrays
  rake3: [-15, 0, 15],
  rake4: [-30, -10, 10, 30],
  rake5: [-40, -20, 0, 20, 40]
};
let rake = rakes["rake4"]; //select the rake you want

//Calculating the size of the canvas according to parent element
const resizeCanvas = (canvas = document.getElementById("canvas")) => {
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
};

//Particles Class
class Particle {
  constructor(x, y) {
    //Set position within canvas
    this.x = x;
    this.y = y;

    //Set color for particles
    this.color = color;
    //Set size
    this.size = 3;
  }
}

//function that takes array values and turns them into an hsl color string so that we can change only the lightness later
function getColorString(hsl) {
  return "hsl(" + hsl[0] + "," + hsl[1] + "%," + hsl[2] + "%)";

}

//Function that redraws the background, particles and rake every frame 
function draw() {

  //drawing background
  let background = [...color];
  background[2] -= 20;
  context.fillStyle = getColorString(background);
  context.fillRect(0, 0, canvas.width, canvas.height);

  //update and draw every particle
  particles.forEach(particle => {
    let xDirection;
    let relativeX = mouseX - particle.x;
    let relativeY = mouseY - particle.y;

    //Literally updating the particle if it's close to one of the rake teeth if the rake is down
    if (isMouseDown) {
      rake.forEach(tooth => {
        let toothY = relativeY + tooth;

        if (relativeX >= 0) {
          if (relativeX <= distance / 2) {
            xDirection = 1;
          }
          else if (relativeX <= distance / 2 + particle.size) {
            xDirection = 0;
          }
          else if (relativeX <= distance + particle.size) {
            xDirection = -1;
          }
        }

        if (typeof xDirection !== "undefined") {
          if (toothY >= 0) {
            if (toothY <= distance / 2) {
              particle.x = particle.x + xDirection;
              particle.y = particle.y + 1;
              particle.color = [...color];
              particle.color[2] += 15;
            }
            else if (toothY <= distance / 2 + particle.size) {
              particle.x = particle.x + xDirection;
              particle.color = [...color];
            }
            else if (toothY <= distance + particle.size) {
              particle.x = particle.x + xDirection;
              particle.y = particle.y - 1;
              particle.color = [...color];
              particle.color[2] -= 35;
            }
          }
        }
      })
    }
    //draw the particle
    context.fillStyle = getColorString(particle.color);
    context.fillRect(
      particle.x + distance / 2 - particle.size / 2,
      particle.y + distance / 2 - particle.size / 2,
      particle.size,
      particle.size
    );
  });

  //we start the rake path/line
  context.beginPath();
  context.strokeStyle = "black";
  context.lineWidth = rakeSize;

  //drawing teeth on the rake
  rake.forEach(toothY => {
    context.moveTo(mouseX, mouseY + toothY);
    context.lineTo(mouseX - rakeSize * 2, mouseY + toothY);
  })

  //drawing rake body
  context.moveTo(mouseX, mouseY + rake[0] - rakeSize / 2);
  context.lineTo(mouseX, mouseY + rake[rake.length - 1] + rakeSize / 2);

  //drawing rake "handle"
  context.moveTo(mouseX, mouseY);
  context.lineTo(mouseX + rakeSize * 6, mouseY + rakeSize * 2);

  //add stroke to rake path
  context.stroke();
  context.closePath();

  //update on next frame
  window.requestAnimationFrame(draw);
}

//Function that positions particles in rows and columns so that they are aligned and spaced evenly
function positionParticles() {
  columns = Math.round(canvas.width / distance);
  rows = Math.round(canvas.height / distance);

  for (i = 0; i < rows * columns; i++) {
    let x = (i % columns) * distance;
    let y = Math.floor(i / columns) * distance;
    particles.push(new Particle(x, y));
  }
}

//Function that calls functions to initiate the canvas
function resetCanvas() {
  particles = [];
  resizeCanvas(canvas);
  positionParticles();
  draw();
}

//listener if the screen is resized
const handleResize = () => {
  if (resizeTimer) {
    clearTimeout(resizeTimer);
  }
  resizeTimer = setTimeout(() => {
    resetCanvas();
  }, 50);
};

//Handle mouse movement function
function handleMouseMove(event) {
  //Set mouse variables
  mouseX = event.offsetX;
  mouseY = event.offsetY;
}
function handleMouseDown(event) {
  isMouseDown = true;
}
function handleMouseUp(event) {
  isMouseDown = false;
}
function handleRakeSelect(event){ //uses value from pushed button to select current rake
  rake = rakes[event.target.value];
}

//getting stuff done the first time you load
function onLoad() {
  resetCanvas();
  //Add the listener 
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mousedown", handleMouseDown); 
  document.addEventListener("mouseup", handleMouseUp); //the mouseUp will work outside of the canvas
  window.addEventListener("resize", handleResize);
  document.getElementById("reset").addEventListener("click", resetCanvas);
  //select all radio buttons from html and loop through them and add event listeners
  let rakeButtons = document.getElementsByClassName("rakeSelect");
  for (i=0; i<rakeButtons.length; i++){
    rakeButtons[i].addEventListener("click", handleRakeSelect);
  }
}

//defining function that runs on load
window.onload = onLoad;



