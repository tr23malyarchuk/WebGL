"use strict";

function Vertex(p) {
  this.p = p;
  this.normal = new Float32Array(3);
  this.triangles = [];
}

function Triangle(v0, v1, v2) {
  this.v0 = v0;
  this.v1 = v1;
  this.v2 = v2;
  this.normal = new Float32Array(3);
  this.tangent = [];
}

// Model Constructor function
function Model(name) {
  this.name = name;
  this.iVertexBuffer = gl.createBuffer();
  this.iNormalBuffer = gl.createBuffer();
  this.iIndexBuffer = gl.createBuffer();
  this.count = 0;

  this.BufferData = function (data) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data.verticesF32, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.iNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data.normalsF32, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data.indicesU16, gl.STATIC_DRAW);

    this.count = data.indicesU16.length;
  };

  this.Draw = function () {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
    gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shProgram.iAttribVertex);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.iNormalBuffer);
    gl.vertexAttribPointer(shProgram.iAttribNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shProgram.iAttribNormal);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);
    gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
  };
}

function getSurfacePoint(u, v) {
  const a = 0.6;
  const p = 2.0;
  const omega = p * u;
  const cosOmega = Math.cos(omega);
  const r = a + v;

  // Encyclopedia parametric formula, Variant 14
  return [
    r * cosOmega * Math.cos(u),
    r * cosOmega * Math.sin(u),
    r * Math.sin(omega),
  ];
}

// Function to compute the angle between two vectors a and b
function angleBetween(a, b) {
  const lenA = Math.hypot(a.at(0), a.at(1), a.at(2));
  const lenB = Math.hypot(b.at(0), b.at(1), b.at(2));
  if (lenA < 0.00001 || lenB < 0.00001) return 0;
  const cosT =
    (a.at(0) * b.at(0) + a.at(1) * b.at(1) + a.at(2) * b.at(2)) / (lenA * lenB);
  return Math.acos(Math.max(-1, Math.min(1, cosT)));
}

// Packing mesh data into typed arrays for WebGL
function packMeshData(vertices, triangles) {
  const data = {};
  data.verticesF32 = new Float32Array(vertices.length * 3);
  data.normalsF32 = new Float32Array(vertices.length * 3);

  for (let i = 0, len = vertices.length; i < len; i++) {
    const v = vertices.at(i);
    data.verticesF32[i * 3 + 0] = v.p.at(0);
    data.verticesF32[i * 3 + 1] = v.p.at(1);
    data.verticesF32[i * 3 + 2] = v.p.at(2);

    data.normalsF32[i * 3 + 0] = v.normal.at(0);
    data.normalsF32[i * 3 + 1] = v.normal.at(1);
    data.normalsF32[i * 3 + 2] = v.normal.at(2);
  }

  data.indicesU16 = new Uint16Array(triangles.length * 3);
  for (let i = 0, len = triangles.length; i < len; i++) {
    const t = triangles.at(i);
    data.indicesU16[i * 3 + 0] = t.v0;
    data.indicesU16[i * 3 + 1] = t.v1;
    data.indicesU16[i * 3 + 2] = t.v2;
  }

  return data;
}

function CreateSurfaceData(uSteps = 60, vSteps = 20) {
  let vertices = [];
  let triangles = [];

  const uMin = 0,
    uMax = 2 * Math.PI;
  const vMin = -0.5,
    vMax = 1;

  // 1. Create Vertex objects on the U and V grid
  for (let j = 0; j <= vSteps; j++) {
    const v = vMin + (j / vSteps) * (vMax - vMin);
    for (let i = 0; i <= uSteps; i++) {
      const u = uMin + (i / uSteps) * (uMax - uMin);
      vertices.push(new Vertex(getSurfacePoint(u, v)));
    }
  }

  // 2. Create Triangle objects and link them to vertices
  const rowLen = uSteps + 1;
  for (let j = 0; j < vSteps; j++) {
    for (let i = 0; i < uSteps; i++) {
      let v0ind = j * rowLen + i;
      let v1ind = v0ind + 1;
      let v2ind = v0ind + rowLen;
      let v3ind = v2ind + 1;

      let trian = new Triangle(v0ind, v1ind, v2ind);
      let trianInd = triangles.length;
      triangles.push(trian);
      vertices.at(v0ind).triangles.push(trianInd);
      vertices.at(v1ind).triangles.push(trianInd);
      vertices.at(v2ind).triangles.push(trianInd);

      let trian2 = new Triangle(v1ind, v3ind, v2ind);
      let trianInd2 = triangles.length;
      triangles.push(trian2);
      vertices.at(v1ind).triangles.push(trianInd2);
      vertices.at(v3ind).triangles.push(trianInd2);
      vertices.at(v2ind).triangles.push(trianInd2);
    }
  }

  // 3. Calculate the normal of each triangle and add it to the vertices with angle weighting
  for (let t of triangles) {
    const p0 = vertices.at(t.v0).p;
    const p1 = vertices.at(t.v1).p;
    const p2 = vertices.at(t.v2).p;

    const ab = [p1.at(0) - p0.at(0), p1.at(1) - p0.at(1), p1.at(2) - p0.at(2)];
    const ac = [p2.at(0) - p0.at(0), p2.at(1) - p0.at(1), p2.at(2) - p0.at(2)];
    const bc = [p2.at(0) - p1.at(0), p2.at(1) - p1.at(1), p2.at(2) - p1.at(2)];

    let nx = ab.at(1) * ac.at(2) - ab.at(2) * ac.at(1);
    let ny = ab.at(2) * ac.at(0) - ab.at(0) * ac.at(2);
    let nz = ab.at(0) * ac.at(1) - ab.at(1) * ac.at(0);
    const len = Math.hypot(nx, ny, nz) || 1;
    t.normal = [nx / len, ny / len, nz / len];

    // Angles at vertices v0, v1, v2
    const w0 = angleBetween(ab, ac);
    const w1 = angleBetween([-ab.at(0), -ab.at(1), -ab.at(2)], bc);
    const w2 = angleBetween(
      [-ac.at(0), -ac.at(1), -ac.at(2)],
      [-bc.at(0), -bc.at(1), -bc.at(2)],
    );

    const weights = [w0, w1, w2];
    const vIndices = [t.v0, t.v1, t.v2];

    for (let k = 0; k < 3; k++) {
      let vObj = vertices.at(vIndices.at(k));
      let w = weights.at(k);
      vObj.normal[0] += t.normal.at(0) * w;
      vObj.normal[1] += t.normal.at(1) * w;
      vObj.normal[2] += t.normal.at(2) * w;
    }
  }

  // 4. Normalize the resulting normals in each vertex
  for (let v of vertices) {
    const len = Math.hypot(v.normal[0], v.normal[1], v.normal[2]) || 1;
    v.normal[0] /= len;
    v.normal[1] /= len;
    v.normal[2] /= len;
  }

  return packMeshData(vertices, triangles);
}

// Generator of a small sphere for the light source
function CreateSphereData(radius = 0.08, steps = 16) {
  let vertices = [];
  let triangles = [];

  for (let j = 0; j <= steps; j++) {
    const theta = (j * Math.PI) / steps;
    for (let i = 0; i <= steps; i++) {
      const phi = (i * 2 * Math.PI) / steps;
      const nx = Math.sin(theta) * Math.cos(phi);
      const ny = Math.cos(theta);
      const nz = Math.sin(theta) * Math.sin(phi);
      let v = new Vertex([radius * nx, radius * ny, radius * nz]);
      v.normal = new Float32Array([nx, ny, nz]);
      vertices.push(v);
    }
  }

  for (let j = 0; j < steps; j++) {
    for (let i = 0; i < steps; i++) {
      const p0 = j * (steps + 1) + i;
      const p1 = p0 + 1;
      const p2 = p0 + steps + 1;
      const p3 = p2 + 1;
      triangles.push(new Triangle(p0, p1, p2));
      triangles.push(new Triangle(p1, p3, p2));
    }
  }

  return packMeshData(vertices, triangles);
}
