
[![Build Status](https://travis-ci.org/opoto/leaflet.polyutils.svg?branch=master)](https://travis-ci.org/opoto/leaflet.polyutils)
# leaflet.polyutils
A set of utilities for Leaflet polylines. Each can be used independently.

## L.PolyPrune.prune(latlngs, options)
L.PolyPrune has a single static method to remove points from a polyline that do not deviate the line from more than a configurable number of meters.
The `options` parameter is a javascript object with following optional value:
* `tolerance`: (number, default: 5) max deviation distance in meter
* `useAlt`: (boolean, default: true) use altitude data to compute 3D distances between points

Example:
```javascript
L.PolyPrune.prune(polyline.getLatLngs(), { tolerance: 10, useAlt: false });
L.PolyPrune.prune(polyline.getLatLngs());
```

## L.PolyTrim
A utility class to delete heading or trailing points from a polyline.

### PolyTrim Constants
* `L.PolyTrim.FROM_START`: Direction constant.
* `L.PolyTrim.FROM_END`: Direction constant.
### PolyTrim Methods
* `L.polyTrim (polyline, direction)`: Creates a new L.PolyTrim instance.
* `trim(n)`: Trims the polyline, and returns the number of removed points (may be smaller than `n` is polyline size was smaller than `n`).
* `getDirection()`: Returns the confirgured direction (`L.PolyTrim.FROM_START` or `L.PolyTrim.FROM_END`).
* `getPolySize()`: Returns the polyline size before trimming.

Example:
```javascript
var polytrim = L.polyTrim(polyline, L.PolyTrim.FROM_END);
var trimmed = polytrim.trim(10); // delete the 10 last points of the polyline
trimmed += polytrim.trim(5); // delete 5 more points
// trimmed is 15 if polyline had at least 15 points
```

## L.PolyStats
A utility class to compute statistics for a polyline:
* To each LatLng point of the polyline are added the following properties:
  * `i`: Index of this point in the polyline.
  * `dist`: Distance from start (in meters).
  * `chrono`: Estimated time to travel from start of polyline to this point, based on the configured speed profile.
  * `chrono_rt`: Estimated time to travel from start of polyline to end then back to this point, based on the configured speed profile.
* To the polyline itself is added a `stats` object with following properties:
  * `minalt`: Smallest elevation value of the polyline points.
  * `maxalt`: Greatest elevation value of the polyline points.
  * `climbing`: Cumulated positive elevation difference between each consecutive polyline points.
  * `descent`: Cumulated negative elevation difference between each consecutive polyline points.

### Speed profiles
A speed profile is a parametrized function:
```
speed = f(slope)
```
Slope between two points is computed by dividing their elevation difference by the distance separating them. Speed is in meters per second.

Several functions are supported, which use different types of parameters:

| Function method            | Parameters | Description |
| -------------------------- | -----------| ----------- |
| `L.PolyStats.REFSPEEDS` | Array of [slope, speed] pairs, sorted by increasing slope| The speed is computed by taking the proportional speed between the 2 closest slopes |
| `L.PolyStats.LINEAR` | Array of 2 numbers [a, b] | The speed is computed with formula: `speed = a*slope + b` |
| `L.PolyStats.POWER` | Array of 2 numbers [a, b] | The speed is computed with formula: `speed = a*slope^b` |
| `L.PolyStats.POLYNOMIAL` | Array of numbers [p0, p1, ..., pn] | The speed is computed with formula: `speed = p0 + p1*slope^1 + ... + pn*slope^n`|


#### Encoding:
A speed profile is encoded as a json value with two fields:
* `method` is the function method, as listed above
* `parameters` is the parameters value as defined above

#### Examples:
```
var sp1 = {
  method : L.PolyStats.REFSPEEDS,
  parameters : [ [-5, 1.2638], [3, 1.25], [2, 1.1111], [6, 0.9722] ]
};
var sp2 = {
  method : L.PolyStats.POLYNOMIAL,
  parameters : [ 1.1, -0.1, -0.001 ]
};
```

### PolyStats Constructor Options
* `chrono`: (default: `true`) If false then computation of `chrono` properties is skipped, gaining some computation time.
* `speedProfile`: (default is `{ method: L.PolyStats.REFSPEEDS, parameters: [0, 1.25] }`) The speed profile as defined above.
* `onUpdate`: (default: `undefined`) If set, this method will be called (without any parameter) at the end of each statistics computation.
* `minspeed`: (default: `0.05`) Computed speeds below this value will be floored to this value

### PolyStats Methods
* `L.polyStats(polyline, options)`: Creates a new L.PolyStats instance.
* `setSpeedProfile(speedprofile)`: Sets a new speed profile. This triggers an update of the statistics if options.chrono is true.
* `updateStatsFrom(i)`: Updates the statistics because point index `i` was changed.
* `computeSpeedProfileFromTrack(geojson, method, iterations, pruning, polydeg, threshold)`: Computes a speedprofile based on a recorded GPS trace. parameters are:
  * `geojson:`: mandatory trace in geojson format.
  * `method`: the speed profile function method to use.
  * `iterations`: 1 for no pruning (recommended), 2 or more to iterate and exclude trace points which are more than `pruning`% different from the computed value.
  * `pruning`: the percentage (number between 0 and 1) parameter for above described pruning
  * `polydeg`: the polynomial degree to use, if POLYNOMIAL method is used (recommended value is 2)
  * `threshold`: ignore speed from the GPS input traces which are below this value.
* `computeSpeedProfileFromSpeeds(refspeeds, method, iterations, pruning, polydeg, threshold)`: Same as above method, but taking as input an array of [slope,speed] pairs instead of a geojson trace.

Example:
```javascript
var polystats = L.polyStats(polyline, {
        speedProfile: {
          method : L.PolyStats.REFSPEEDS,
          parameters : [ [-5, 1.2638], [3, 1.25], [2, 1.1111], [6, 0.9722] ]
        }
      })
polytrim.updateStatsFrom(0);
var pts = polyline.getLatLngs();
var lastpt = pts[pts.length - 1];
var txt = 'polyline length is ' + laspt.dist + 'm' +
          ', will take ' + lastpt.chrono + 's to travel';
```

## Live demo

https://opoto.github.io/leaflet.polyutils/examples
