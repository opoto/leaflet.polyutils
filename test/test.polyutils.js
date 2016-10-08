var assert = chai.assert;
var PL0 = L.polyline([]);
var PL1 = L.polyline([
    [46.11874, 6.82929, 2013]
]);
var PL2 = L.polyline([
    [46.11874, 6.82929, 2013],
    [46.1186, 6.82944, 2013]
]);
var PL3 = L.polyline([
    [46.1186, 6.82944],
    [46.1187, 6.82945],
    [46.1188, 6.82946]
]);
var PL4 = L.polyline([
    [46.11, 6.83],
    [46.12, 6.78],
    [46.13, 6.81],
    [46.14, 6.77]
]);
var PL5 = L.polyline([
    [46.11874, 6.82929, 2010],
    [46.1186, 6.82944, 2005],
    [46.11845, 6.82978, 2000],
    [46.11824, 6.83002, 2020],
    [46.11804, 6.83019, 2030]
]);

describe('L.PolyUtil.prune', function() {

    it('should not prune when size is < 3', function(done) {
        var pts;
        var pruned;
        var i;
        var pls;
        for (i = 0, pls = [PL0, PL1, PL2]; i < pls.length; i++) {
            pts = pls[i].getLatLngs();
            pruned = L.PolyUtil.prune(pts, 1000);
            assert.isTrue(pruned.length === pts.length);
        }
        done();
    });

    it('should prune when within distance', function(done) {
        assert.isTrue(L.PolyUtil.prune(PL3.getLatLngs(), 10).length === PL3.getLatLngs().length - 1);
        done();
    });

    it('should not prune when not within distance', function(done) {
        assert.isTrue(L.PolyUtil.prune(PL4, 10).getLatLngs().length === PL4.getLatLngs().length);
        done();
    });

});

describe('L.PolyTrim', function() {

    it('should be idempotent on empty polyline', function(done) {
        var polytrim = L.Util.polyTrim(PL0, L.Util.PolyTrim.FROM_END);
        polytrim.trim(1);
        assert.isTrue(PL0.getLatLngs().length === 0);
        polytrim = L.Util.polyTrim(PL0, L.Util.PolyTrim.FROM_START);
        polytrim.trim(1);
        assert.isTrue(PL0.getLatLngs().length === 0);
        done();
    });

    it('should be idempotent when parameter is 0', function(done) {
        var polytrim = L.Util.polyTrim(PL3, L.Util.PolyTrim.FROM_END);
        polytrim.trim(0);
        assert.isTrue(PL3.getLatLngs().length === 3);
        polytrim = L.Util.polyTrim(PL3, L.Util.PolyTrim.FROM_START);
        polytrim.trim(0);
        assert.isTrue(PL3.getLatLngs().length === 3);
        done();
    });

    it('should trim', function(done) {
        var polytrim = L.Util.polyTrim(PL3, L.Util.PolyTrim.FROM_END);
        polytrim.trim(1);
        assert.isTrue(PL3.getLatLngs().length === 2);
        polytrim = L.Util.polyTrim(PL3, L.Util.PolyTrim.FROM_START);
        polytrim.trim(1);
        assert.isTrue(PL3.getLatLngs().length === 1);
        done();
    });

    it('should wait for last trim to commit', function(done) {
        var polytrim = L.Util.polyTrim(PL4, L.Util.PolyTrim.FROM_END);
        polytrim.trim(3);
        polytrim.trim(1);
        assert.isTrue(PL4.getLatLngs().length === 3);
        polytrim = L.Util.polyTrim(PL4, L.Util.PolyTrim.FROM_START);
        polytrim.trim(2);
        polytrim.trim(1);
        assert.isTrue(PL4.getLatLngs().length === 2);
        done();
    });
});

describe('L.PolyStats', function() {

    it('should work on empty polyline', function(done) {
        var polystats = L.Util.polyStats(PL0, {
            speedProfile: [
                [0, 1]
            ]
        });
        polystats.updateStatsFrom(0);
        assert.isTrue(typeof PL0.stats !== 'undefined');
        done();
    });

    it('should provide stats', function(done) {
        var pts = PL5.getLatLngs();
        var first = pts[0];
        var last = pts[pts.length - 1];
        var callback = sinon.spy();
        var polystats = L.Util.polyStats(PL5, {
            speedProfile: [
                [0, 1]
            ],
            onUpdate: callback
        });
        polystats.updateStatsFrom(0);
        assert.isTrue(typeof PL5.stats !== 'undefined');
        assert.isTrue(PL5.stats.minalt === 2000);
        assert.isTrue(PL5.stats.maxalt === 2030);
        assert.isTrue(first.dist === 0);
        assert.isTrue(first.chrono === 0);
        assert.isTrue(first.chrono_rt > 0);
        assert.isTrue(last.dist > 0);
        assert.isTrue(last.chrono > 0);
        assert.isTrue(last.chrono_rt === last.chrono);
        assert.isTrue(callback.called);
        done();
    });

});
