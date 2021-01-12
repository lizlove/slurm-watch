# Slurm Watch

An Electron application to display live slurm usage metrics at the Flatiron Institute.

## Installation

To start SlurmWatch locally use:

```
yarn start
```

## Notes

### Completed charts

- Stacked bar: CPUs free by location / total CPU nodes available
- Doughnuts: GPUs free by location (rusty & popeye)
- Table: Current queue length by center
- Line graph: Nodes by center over 7 days
- Bubbleplot: Wait time by center over 24 hours

### Charts To Do

- _Tbd:_ Iron broadwell & skylight
- CPU nodes currently allocated by account (or partition) aka center as a sunburst chart

### Misc todos

- Style current queue table
- Combine flexboxgrid & stylesheet and minify
- Reorder barchart according to keys provided
- Style and add cool fonts
- Improve labeling
- Add open GPUs/CPUs as number under the donut
- Handle erroring on bubbleplot
- Hover on bubbleplot

### Other charts for potential v2?

- CPU efficiency by center as racecars
- Toggle num queue items by center with queue items by location (gordon etc)
