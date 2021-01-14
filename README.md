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
