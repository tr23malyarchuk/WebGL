## Practical Assignment #1 - Surface Rendering

**Objective**: to scrutinize WebGL basics on a practical example; learn to understand and use WebGL skeleton; mark presence in the credit module.

### Variant #14 - **Conical Surface with a Directrix Curve on a Sphere**

- Basing on the skeleton project **add a new js script file** containing Model object.
- Model object has to draw the surface wireframe as two sets: a set of U polylines and a set of V polylines.
- Render wire-frame model representing anylytical surface using WebGL

## Conical Surface with a Directrix Curve on a Sphere

A vertex of a conical surface with a directrix curve on a sphere lies _in the center of the base sphere_.\
**An arbitrary directrix curve** is placed on surface of the same sphere with a radius _a_ and is given by a _vector equation_:\
$e_0=e_0(u)=a(icosu+jsinu)cos\omega+kasin\omega$, where $\omega=pu; p=const$.

A parametrical form of definition is\
$x=x(u,v)=(a+v)cos\omega cosu,\\ y=y(u,v)=(a+v)cos\omega sinu,\\ z=z(u,v)=(a+v)sin\omega$.

A conical surface:

- will be _inside_ the base sphere if $v<0$;
- will be _outside_ the base sphere if $v>0$.

In both cases, a directrix curve is placed on the sphere with radius _a_.\
The surface is given in lines of principal curvatures $u$, $v$.

## WebGL

Project that accompanies VGGI credit module.

Visit vggi-kpi.blogspot.com for more information
