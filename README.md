# Landscape

My third WebGPU exploration.

I leaned into the Jotai for the curation of both state and derived state, which is particularly useful for the complex
state required to maintain a WebGPU configuration. The more I use Jotai, the more I enjoy its design.

Chakra UI is quite opinionated, and pulls focus from the first-person controller in some scenarios, but is quite
lightweight and clean compared with MUI, so I might persevere with it.

I started wanting to build a landscape with a "Game Of Thrones opening sequence" aesthetic. I ended up using [Inigo Quilez's terrain demo](https://www.shadertoy.com/view/4ttSWf)) as a starting point and source of the random landscape, but impementing Marching
Squares to build the geometry, as I had [recently played with raymarching](https://alecmce.com/webgpu/).

The phong shading, sky rendering and first-person camera were additions to make the demo a bit more interesting to play
with.

Live demo here: https://alecmce.com/landscape.
Source code here: https://github.com/alecmce/landscape

## References

- [IQ's Painting A Landscape With Math (YouTube)](https://www.youtube.com/watch?v=BFld4EBO2RE)
- [IQ's Terrain Demo (Shadertoy)](https://www.shadertoy.com/view/4ttSWf)
- [Fractional Brownian Motion](https://iquilezles.org/articles/fbm/)
- [Jotai](https://jotai.org/)
- [Chakra UI](https://v2.chakra-ui.com/)
- [WebGPU Function Reference](https://webgpufundamentals.org/webgpu/lessons/webgpu-wgsl-function-reference.html)
