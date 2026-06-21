# Point Cloud Viewer

This project is a prototype point cloud viewer built using Next.js, React, Three.js, and React Three Fiber.

## Technology Choices

Although the original specification suggested Angular, I chose to build this project using React and React Three Fiber.

The primary reason for this decision is that React is the framework I use professionally on a daily basis, allowing me to focus my time on solving the technical challenges of the exercise rather than learning a new framework from scratch. My goal was to demonstrate my approach to loading, parsing, streaming and rendering large point cloud datasets as effectively as possible.

React Three Fiber (R3F) is a React renderer for Three.js. Rather than being a separate 3D engine, it is effectively a React abstraction over Three.js, with most concepts mapping directly to their Three.js equivalents. Knowledge gained in R3F transfers directly to Three.js and vice versa.

I am aware that Angular is used within the company and would be happy to learn and work with Angular should I be successful in the application process. For the purposes of this exercise, I felt it was more valuable to demonstrate my understanding of 3D rendering, data streaming, and application architecture using technologies I already know well.

## Features

- Streaming point cloud loading
- Custom CPT file parser
- Progressive rendering while data loads
- Real-time loading progress indicator
- Orbit camera controls
- Vertex colour rendering
- Efficient typed-array based memory management
- Local coordinate transformation for improved rendering precision

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

## Notes

The CPT loader streams point data in batches and progressively updates the rendered point cloud. Point coordinates are reconstructed using the scale and offset values stored in the CPT header before being converted into local coordinates for rendering. This helps avoid floating-point precision issues commonly encountered when working with large geospatial coordinate systems.

The focus of this exercise was correctness, readability, and demonstrating an understanding of handling large point cloud datasets in the browser.
