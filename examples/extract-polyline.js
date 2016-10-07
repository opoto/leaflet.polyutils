function round(number, precision) {
    var factor = Math.pow(10, precision);
    var tempNumber = number * factor;
    var roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
};

var pts = track.getLatLngs();
var decl = "\n";
for (var i = 0; i < pts.length ; i++) {
  var pt = pts[i];
  decl += "  ["+round(pt.lat,4)+","+round(pt.lng,4)+","+Math.round(pt.alt)+"],\n";
}
decl += "\n";
console.log(decl)
