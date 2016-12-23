# d3-shotchart

Basketball fans are paying attention to stats and advanced metrics more than ever. There exists few open source tools to help facilitate the display and distribution of the data fans care about. With d3-shotchart, you can easily build a visualization that enables fans to interact with NBA shot data (publicly available elsewhere).

[<img alt="NBA Shotcharts" src="https://gist.githubusercontent.com/mamcmanus/c5cfffeee48c51343405b2e66f388d7c/raw/3d27381ece8d08a4c0fd263e18ee89990392f16b/preview.png" width="420" />](http://bl.ocks.org/mamcmanus/c5cfffeee48c51343405b2e66f388d7c)

## Installing

If you use NPM, `npm install d3-shotchart`. Otherwise, download the [latest release](https://github.com/d3/d3-shotchart/releases/latest).

### Dependencies

d3-shotchart depends on [d3-tip](https://github.com/Caged/d3-tip) and [d3-hexbin](https://github.com/d3/d3-hexbin)
Be sure to include these dependencies above d3-shotchart in your code.

## Data Requirements

### Minimum requirements

The bare minimum data requirements for the plugin to display data are:
1. x coordinate with a value betweeon 0-50
2. y coordinate with a value between 0-47

Example format:
```js
[ 
  {
    "x": 19.5,
    "y": 28.45
  }
]
```

### Tooltip requirements

To take full advantage of the tooltip functionality, your data should include a few other publicly available data points:
* "Action Type"
* "Shot Distance"

Example format:
```js
[ 
  {
    "x": 19.5,
    "y": 28.45,
    "action_type": "Jump Shot",
    "shot_distance": 24,
  }
]
```

## Demo

Here is an [interactive visualization](https://hinkie.rip/) of Philadelphia 76ers data that takes advantage of most of d3-shotchart's configuration options.

## Example usage

```js
<div id="shot-chart"></div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/4.4.0/d3.min.js"></script> 
<script src="https://d3js.org/d3-hexbin.v0.2.min.js"></script> 
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3-tip/0.7.1/d3-tip.min.js"></script>
<script src="d3-shotchart.js" ></script>
<script src="shots.js" ></script>

<script> 
    var courtSelection = d3.select("#shot-chart");
    var court = d3.court().width(600);
    var shots = d3.shots().shotRenderThreshold(1).displayToolTips(true).displayType("hexbin");
    courtSelection.call(court);
    courtSelection.datum(data).call(shots);
</script>
```

## API Reference

<a href="#court" name="court">#</a> <b>court</b>()

Constructs a new default court generator.

<a name="court_width" href="#court_width">#</a> <i>court</i>.<b>width</b>([<i>width</i>])

If <i>width</i> is specified, sets the courth width to the specified number and returns the court generator. If <i>width</i> is not specified, returns the current court width accessor, which defaults to:

```js
function width() {
  return 500;
}
```

Court height is always automatically generated as a function of court width. Default NBA half-court dimensions are 50 x 47 feet. As such, the height of the court is always equal to .94 * court width. 

<a href="#shots" name="shots">#</a> <b>shots</b>()

Constructs a new default shots generator.

<a name="shots_displayType" href="shots_displayType">#</a> <i>shots</i>.<b>displayType</b>([<i>displayType</i>])

displayType can only be one of two values:
1. "scatter"
2. "hexbin"

If <i>displayType</i> is specified, sets shot display type to the specified value and returns the shots generator. If <i>displayType</i> is not specified, returns the current shot displayType accessor, which defaults to:

```js
function displayType() {
  return "scatter";
}
```

<a name="shots_shotRenderThreshold" href="shots_shotRenderThreshold">#</a> <i>shots</i>.<b>shotRenderThreshold</b>([<i>shotRenderThreshold</i>])

shotRenderThreshold can be any integer greater than 0

If <i>shotRenderThreshold</i> is specified, sets the minimum number of shots required for a hexbin to display and returns the shots generator. If <i>displayType</i> is not specified, returns the current shot displayType accessor, which defaults to:

```js
function shotRenderThreshold() {
  return 1;
}
```

<a name="shots_displayToolTips" href="shots_displayToolTips">#</a> <i>shots</i>.<b>displayToolTips</b>([<i>displayToolTips</i>])

displayToolTips can only be set to true or false

If <i>displayToolTips</i> is specified, sets the tool tip display to the specified value and returns the shots generator. If <i>displayToolTips</i> is not specified, returns the current shot displayToolTips accessor, which defaults to:

```js
function shotRenderThreshold() {
  return false;
}
```