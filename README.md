# Point Cloud Viewer

This project is a prototype point cloud viewer built using Next.js, React, Three.js, and React Three Fiber.

## Technology Choices

Although the original specification suggested Angular, I chose to build this project using React and React Three Fiber.

The primary reason for this decision is that React is the framework I use professionally on a daily basis, allowing me to focus my time on solving the technical challenges of the exercise rather than learning a new framework from scratch. My goal was to demonstrate my approach to loading, parsing, streaming and rendering large point cloud datasets as effectively as possible.

React Three Fiber (R3F) is a React renderer for Three.js. Rather than being a separate 3D engine, it is effectively a React abstraction over Three.js, with most concepts mapping directly to their Three.js equivalents. Knowledge gained in R3F transfers directly to Three.js and vice versa.

I am aware that Angular is used within the company and would be happy to learn and work with Angular should I be successful in the application process. For the purposes of this exercise, I felt it was more valuable to demonstrate my understanding of 3D rendering, data streaming, and application architecture using technologies I already know well.

## Getting Started

Install dependencies:

```bash
yarn install
```

Run the development server:

```bash
yarn dev
```

Open:

```text
http://localhost:3000
```

in your browser.

## Performance Considerations

Currently we render all points, however this is probably for our use case. Ideally we need to look at level of details, i.e. only rendering every 4th/8th/16th point on lower powered devices, which we can check check fps of device using Performance Monitor and then filter out points, reload points in as needed

Another option would be to only load points that are nearest the camera

As mentioned in the code notes, I am not massively happy with the point raycasting to select a point, there is no upper limit on the amount of points that could be intersected, again some kind of chunking with spatial indexing could be used so we only check the spatial index nearest the camera.

It is also apparent there are quite a few artifacts in the point cloud, these would ideally need tidying up, maybe by checking for neighbour points, if there's not many then assume they are incorrect, and remove them from the scene

## Further improvements

- Current error handing is basic. The BE is not checking that the file is valid type before streaming it, we do check that it exists. But it's not very robust.

- We don't check that all chunks are received in tact from the BE as well.

- Camera alignment could be improved, and the axis directions are not immediately obvious to the user.

## Notes

The CPT loader streams point data in batches and progressively updates the rendered point cloud. Point coordinates are reconstructed using the scale and offset values stored in the CPT header before being converted into local coordinates for rendering.

The focus of this exercise was correctness, readability, and demonstrating an understanding of handling large point cloud datasets in the browser.
