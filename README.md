# leaflet.polyutils
A set of utilities for Leaflet polylines. Each can be used independently.

## L.PolyUtil.prune
A new method added to L.PolyUtil to remove points from a polyline that do not deviate the line from more than a configurable number of meters.

Example:
```javascript
L.PolyUtil.prune(5);
```

## L.Util.PolyTrim
A utility class to delete heading or trailing points from a polyline.

### Constants
* `L.Util.PolyTrim.FROM_START`: Direction constant.
* `L.Util.PolyTrim.FROM_END`: Direction constant.
### Methods
* `L.Util.polyTrim (polyline, direction)`: Creates a new L.Util.PolyTrim instance.
* `trim(n)`: Trims the polyline, and returns the number of removed points (may be smaller than `n` is polyline size was smaller than `n`).
* `getDirection()`: Returns the confirgured direction (`L.Util.PolyTrim.FROM_START` or `L.Util.PolyTrim.FROM_END`).
* `getPolySize()`: Returns the polyline size before trimming.

Example:
```javascript
var polytrim = L.Util.polyTrim(polyline, L.Util.PolyTrim.FROM_END);
var trimmed = polytrim.trim(10); // delete the 10 last points of the polyline
trimmed += polytrim.trim(5); // delete 5 more points
// trimmed is 15 if polyline had at least 15 points
```

## L.Util.PolyStats
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

The `chrono` properties are computed based on a speed profile defined by an array of value pairs, where the first value is the slope, and the second is the speed for that slope. Slope between two points is computed by dividing their elevation difference by the distance separating them. Speed is in meters per second.


### Constructor Options
* `chrono`: (default: `true`) If false then computation of `chrono` properties is skipped, gaining some computation time.
* `speedProfile`: (default: `[]`) The speed profile as defined above.
* `onUpdate`: (default: `undefined`) If set, this method will be called (without any parameter) at the end of each statistics computation.

### Methods
* `L.Util.polyStats(polyline, options)`: Creates a new L.Util.PolyStats instance.
* `setSpeedProfile(speedprofile)`: Sets a new speed profile. This triggers an update of the statistics if options.chrono is true.
* `updateStatsFrom(i)`: Updates the statistics because point index `i` was changed.

Example:
```javascript
var polystats = L.Util.polyStats(polyline,{
        speedProfile: [
            [-35, 0.4722], [-25, 0.555], [-20, 0.6944], [14, 0.8333],
            [-12, 0.9722], [-10, 1.1111], [-8, 1.1944], [-6, 1.25],
            [-5, 1.2638], [3, 1.25], [2, 1.1111], [6, 0.9722],
            [10, 0.8333], [15, 0.6944], [19, 0.5555], [26, 0.4166],
            [38, 0.2777]
        ]
      })
polytrim.updateStatsFrom(0);
var pts = polyline.getLatLngs();
var lastpt = pts[pts.length - 1];
var txt = 'polyline length is ' + laspt.dist + 'm' +
          ', will take ' + lastpt.chrono + 's to travel';
```

## Live demo

https://opoto.github.io/leaflet.polyutils/examples
