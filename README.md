## Practical Assignment #2 - Lighting

**Objective**: To apply lighting on the surface

### Variant #14 - **Conical Surface with a Directrix Curve on a Sphere** - **Shading** _Gouraud_ - **Vertex Normal** _Facet Angle Weighted average_

Use sources from _PA#1_ adding a new functionality as follows:

- Render the surface with filled triangles using VBO (Vertex Buffer Object) technology with indices;
- Add two sliders providing ability to control surface granularity over U and V directions;
- Implement triangle shading method as per variant;
- Implement vertex and pixel shaders that calculate intensity of illumination for the surface coming from a single light source:\
   $(I_{rgb})=Ambient+Diffuse+Specular$\
  that rotates in a circular motion around the surface.

**Details on Vertex Normals Calculation**

- <u>Facet Angle Weighted Average normal</u>: sum all facet normals that are adjacent to the vertex to form a vertex normal using angle as a weight coefficient, normalize the result.

**Details on Gouraud/Phong shading**

Implement the necessary code in .js and/or vertex/fragment shader.

**Details on a point light source**

- pass coordinates of a light source to GPU as uniform parameter;
- do not forget to multiply the coordinates by ModelView matrix before passing them to GPU.

**Details on projection**

use single point perspective/orthographic matrix.

**Hint**

- when calculating specular component you can take $(0,0,1)$ direction vector as the vector pointing towards the viewer instead of calculating per-pixel direction (global viewer model);
- intensity of the light source components can be hardcoded in the shader;
- you can calculate the world coordinates of each point in fragment shader interpolating vertex coordinates using hardware interpolator (_varying_ keyword);
- If you need to interpolate normals along primitive pass them to fragment shader using _varying_ keyword.

## Conical Surface with a Directrix Curve on a Sphere

A vertex of a conical surface with a directrix curve on a sphere lies _in the center of the base sphere_.\
**An arbitrary directrix curve** is placed on surface of the same sphere with a radius _a_ and is given by a _vector equation_:\
$\vec{e}_0=\vec{e}_0(u)=a(\vec{i}\cos u+\vec{j}\sin u)\cos\omega+\vec{k}a\sin\omega$, where $\omega=pu; p=const$.

A parametrical form of definition is\
$x=x(u,v)=(a+v)\cos\omega\cos u,\\ y=y(u,v)=(a+v)\cos\omega\sin u,\\ z=z(u,v)=(a+v)\sin\omega$.

A conical surface:

- will be _inside_ the base sphere if $v<0$;
- will be _outside_ the base sphere if $v>0$.

In both cases, a directrix curve is placed on the sphere with radius _a_.\
The surface is given in lines of principal curvatures $u$, $v$.

## WebGL

Project that accompanies VGGI credit module.

Visit vggi-kpi.blogspot.com for more information
