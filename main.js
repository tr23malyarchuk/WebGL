"use strict";

let gl;
let surface;
let lightSphere; // Object model for the light source sphere
let shProgram;
let spaceball;
let lightAngle = 0;

function ShaderProgram(name, program) {
  this.name = name;
  this.prog = program;

  this.iAttribVertex = -1;
  this.iAttribNormal = -1;
  this.iColor = -1;
  this.iModelViewMatrix = -1;
  this.iProjectionMatrix = -1;
  this.iLightPos = -1;
  this.iIsLight = -1;

  this.Use = function () {
    gl.useProgram(this.prog);
  };
}

function updateSurface() {
  const u = +document.getElementById("uSlider").value;
  const v = +document.getElementById("vSlider").value;
  surface.BufferData(CreateSurfaceData(u, v));
}

function draw() {
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  let projection = m4.perspective(Math.PI / 8, 1280 / 720, 4, 20);
  let modelView = spaceball.getViewMatrix();

  let rotateToPointZero = m4.axisRotation([0.707, 0.707, 0], 0.7);
  let translateToPointZero = m4.translation(0, 0, -10);

  let matAccum0 = m4.multiply(rotateToPointZero, modelView);
  let matAccum1 = m4.multiply(translateToPointZero, matAccum0);

  // Light position coordinates, rotating around a circle of radius 1.8
  let lx = 1.8 * Math.cos(lightAngle);
  let ly = 0.8;
  let lz = 1.8 * Math.sin(lightAngle);

  // Multiplying the light coordinates on the model-view matrix before passing them to the shader,
  // so that the light position is in the same coordinate system as the surface.
  let m = matAccum1;
  let viewLight = [
    m.at(0) * lx + m.at(4) * ly + m.at(8) * lz + m.at(12),
    m.at(1) * lx + m.at(5) * ly + m.at(9) * lz + m.at(13),
    m.at(2) * lx + m.at(6) * ly + m.at(10) * lz + m.at(14),
  ];

  gl.uniformMatrix4fv(shProgram.iProjectionMatrix, false, projection);
  gl.uniform3fv(shProgram.iLightPos, viewLight);

  // Draw the main surface with lighting
  gl.uniform1i(shProgram.iIsLight, 0);
  gl.uniformMatrix4fv(shProgram.iModelViewMatrix, false, matAccum1);
  gl.uniform4fv(shProgram.iColor, [1, 0.85, 0.1, 1]);
  surface.Draw();

  // Draw the light source as a small sphere
  let lightModelView = m4.multiply(matAccum1, m4.translation(lx, ly, lz));
  gl.uniform1i(shProgram.iIsLight, 1);
  gl.uniformMatrix4fv(shProgram.iModelViewMatrix, false, lightModelView);
  gl.uniform4fv(shProgram.iColor, [1, 1, 0.9, 1]);
  lightSphere.Draw();
}

function animate() {
  lightAngle += 0.02;
  draw();
  requestAnimationFrame(animate);
}

function initGL() {
  let prog = createProgram(gl, vertexShaderSource, fragmentShaderSource);

  shProgram = new ShaderProgram("Basic", prog);
  shProgram.Use();

  shProgram.iAttribVertex = gl.getAttribLocation(prog, "vertex");
  shProgram.iAttribNormal = gl.getAttribLocation(prog, "normal");
  shProgram.iModelViewMatrix = gl.getUniformLocation(prog, "ModelViewMatrix");
  shProgram.iProjectionMatrix = gl.getUniformLocation(prog, "ProjectionMatrix");
  shProgram.iLightPos = gl.getUniformLocation(prog, "lightPos");
  shProgram.iColor = gl.getUniformLocation(prog, "color");
  shProgram.iIsLight = gl.getUniformLocation(prog, "isLight");

  surface = new Model("Surface");
  surface.BufferData(CreateSurfaceData());

  lightSphere = new Model("LightSphere");
  lightSphere.BufferData(CreateSphereData(0.08, 16));

  gl.enable(gl.DEPTH_TEST);
}

function createProgram(gl, vShader, fShader) {
  let vsh = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vsh, vShader);
  gl.compileShader(vsh);
  if (!gl.getShaderParameter(vsh, gl.COMPILE_STATUS)) {
    throw new Error("Error in vertex shader:  " + gl.getShaderInfoLog(vsh));
  }
  let fsh = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fsh, fShader);
  gl.compileShader(fsh);
  if (!gl.getShaderParameter(fsh, gl.COMPILE_STATUS)) {
    throw new Error("Error in fragment shader:  " + gl.getShaderInfoLog(fsh));
  }
  let prog = gl.createProgram();
  gl.attachShader(prog, vsh);
  gl.attachShader(prog, fsh);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error("Link error in program:  " + gl.getProgramInfoLog(prog));
  }
  return prog;
}

function init() {
  let canvas;
  try {
    canvas = document.getElementById("webglcanvas");
    gl = canvas.getContext("webgl");
    if (!gl) {
      throw "Browser does not support WebGL";
    }
  } catch (e) {
    document.getElementById("canvas-holder").innerHTML =
      "<p>Sorry, could not get a WebGL graphics context.</p>";
    return;
  }
  try {
    initGL();
  } catch (e) {
    document.getElementById("canvas-holder").innerHTML =
      "<p>Sorry, could not initialize the WebGL graphics context: " +
      e +
      "</p>";
    return;
  }

  spaceball = new TrackballRotator(canvas, draw, 0);
  animate();
}
