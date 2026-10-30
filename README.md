# Mouse Picker

Browse gaming mice in 3D and see what is inside them: brand, sensor, main switches and scroll encoder. Inspired by sites like eloshapes, but built around the internals, not only the shape.

Built with Next.js, React Three Fiber and TypeScript. There is no database yet; the data is static JSON.

## Features

- 306 mice with sensor, switch and encoder data.
- Search by brand, model or sensor, and filter by brand, sensor and switch brand.
- 3D model you can orbit, with Top, Side, Front and Back view presets.
- **X-ray internals** shows the sensor, PCB, main switches and scroll encoder with labels.
- **Compare shapes** overlays a second mouse as an orange wireframe on the first.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Data and accuracy

- `data/mice.json` holds sensors, switches and encoders collected from public review data (TechPowerUp mouse reviews). Encoder brands are mostly `Unknown` because they need teardown photos. Check any entry against the source review before relying on it.
- `data/shapes.json` holds measurements in mm. Only three mice have them, and those values are approximate. Every other mouse uses a **generic shape**, which the details panel says plainly. Add real measurements there to improve the model.
- The 3D body is procedural: a length, width, height and hump position produce the shell. It is a stand-in for real scans, not a replica of any product.
- The internals are schematic. Their positions are not taken from teardown photos.

## Ideas

- Add measured dimensions for more mice (a `shapes.json` entry is all it takes).
- Load real GLB scans instead of the procedural body.
- Add weight, wireless, polling rate and price to the data and filter on them.
- Move the data to Neon Postgres and add an API route.
