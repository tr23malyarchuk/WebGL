"use strict";

function Model(name) {
  this.name = name;
  this.iVertexBuffer = gl.createBuffer();
  this.count = 0;

  this.BufferData = function (vertices) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
    // STATIC_DRAW for optimal memory usage since our wireframe geometry is static
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    this.count = vertices.length / 3;
  };

  this.Draw = function () {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
    gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shProgram.iAttribVertex);

    gl.drawArrays(gl.LINES, 0, this.count);
  };
}

function getSurfacePoint(u, v) {
  const a = 0.6; // Optimized radius to fit into the perspective view
  const p = 2.0; // Variant structural constant
  const omega = p * u;

  const cosOmega = Math.cos(omega);
  const r = a + v;

  // Encyclopedia parametric formula, Variant 14
  const x = r * cosOmega * Math.cos(u);
  const y = r * cosOmega * Math.sin(u);
  const z = r * Math.sin(omega);

  return [x, y, z];
}

function CreateSurfaceData() {
  // Resolution controls (affects wireframe grid smoothness)
  const uSteps = 60;
  const vSteps = 20;

  const uMin = 0;
  const uMax = 2 * Math.PI;
  const vMin = -0.5; // To fit the surface into the scene
  const vMax = 1;

  // Calculate precise total vertex count
  const totalVertices = (vSteps + 1) * uSteps * 2 + (uSteps + 1) * vSteps * 2;
  const vertexList = new Float32Array(totalVertices * 3);
  let index = 0;

  // 1. Generate U polylines (where V - constant, U - variable)
  for (let j = 0; j <= vSteps; j++) {
    const v = vMin + (j / vSteps) * (vMax - vMin);
    for (let i = 0; i < uSteps; i++) {
      const u1 = uMin + (i / uSteps) * (uMax - uMin);
      const u2 = uMin + ((i + 1) / uSteps) * (uMax - uMin);

      const p1 = getSurfacePoint(u1, v);
      const p2 = getSurfacePoint(u2, v);

      vertexList[index++] = p1[0];
      vertexList[index++] = p1[1];
      vertexList[index++] = p1[2];
      vertexList[index++] = p2[0];
      vertexList[index++] = p2[1];
      vertexList[index++] = p2[2];
    }
  }

  // 2. Generate V polylines (where U - constant, V - variable)
  for (let i = 0; i <= uSteps; i++) {
    const u = uMin + (i / uSteps) * (uMax - uMin);
    for (let j = 0; j < vSteps; j++) {
      const v1 = vMin + (j / vSteps) * (vMax - vMin);
      const v2 = vMin + ((j + 1) / vSteps) * (vMax - vMin);

      const p1 = getSurfacePoint(u, v1);
      const p2 = getSurfacePoint(u, v2);

      vertexList[index++] = p1[0];
      vertexList[index++] = p1[1];
      vertexList[index++] = p1[2];
      vertexList[index++] = p2[0];
      vertexList[index++] = p2[1];
      vertexList[index++] = p2[2];
    }
  }

  return vertexList;
}
