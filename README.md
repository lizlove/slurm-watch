# Slurm Watch

An Electron application to display live slurm usage metrics at the Flatiron Institute.

## Prerequisites

Before proceeding with Slurm Watch you need to install [Node.js](https://nodejs.org/en/download/). We recommend that you install either the latest LTS or Current version available.

Please install Node.js using pre-built installers for your platform. You may encounter incompatibility issues with different development tools otherwise.

To check that Node.js was installed correctly, type the following commands in your terminal client:

```
  node -v
  npm - v;
```

## Installation

0. Clone this repository locally. See the green _Code_ button above for details.

1. Install the `node_modules` via your preferred dependency manager. [npm](https://www.npmjs.com/) comes built into Node.js This project is also [yarn](https://classic.yarnpkg.com/en/) compatible.

```
  npm install
  yarn install
```

2. Create a variables.env file at the root of your local repository and add the following variables.

```
  PROMETHEUS_USER=<your prometheus username>
  PROMETHEUS_PASS=<your prometheus pass>
```

## Running Locally

You are now reading to run the app with the following command:

```
  npm run start
  yarn start
```

ESLint is configured in this repo. Run the following script to lint your code.

```
  npm run lint
  yarn lint
```

## Notes

### Completed charts

- Stacked bar: CPUs free by location / total CPU nodes available
- Doughnuts: GPUs free by location (rusty & popeye)
- Table: Current queue length by center
- Line graph: Nodes by center over 7 days
- Bubbleplot: Wait time by center over 24 hours

### To Do

- CPU nodes currently allocated by account (or partition) aka center as a sunburst chart
- Fix to single page of responsive screen sizes
- Style current queue table
- Reorder barchart according to keys provided
- Add open GPUs/CPUs as number under the donut
- Handle erroring on bubbleplot
- Hover on bubbleplot
- Improve labeling

### Other charts for potential v2?

- _Tbd:_ Iron broadwell & skylight
- CPU efficiency by center as racecars
- Toggle num queue items by center with queue items by location (gordon etc)
