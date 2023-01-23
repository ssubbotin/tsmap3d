/*  Line of sight intersection of space observer to ellipsoid  */

import {ecef2geodetic, enu2uvw, geodetic2ecef} from './ecef';
import {nan, pi, power, sqrt} from './mathfun';
import {wgs84} from "./ellipsoid";
import {assert} from "./funcutils";
import {aer2enu} from "./enu";

export {lookAtSpheroid};

function lookAtSpheroid(lat0, lon0, h0, az, tilt, ell = null, deg = true) {
    /*
    Calculates line-of-sight intersection with Earth (or other ellipsoid) surface from above surface / orbit

    Parameters
    ----------

    lat0 : float
    observer geodetic latitude
    lon0 : float
    observer geodetic longitude
    h0 : float
    observer altitude (meters)  Must be non-negative since this function doesn't consider terrain
    az : float
    azimuth angle of line-of-sight, clockwise from North
    tilt : float
    tilt angle of line-of-sight with respect to local vertical (nadir = 0)
    ell : Ellipsoid, optional
    reference ellipsoid
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Results
    -------

    lat : float
    geodetic latitude where the line-of-sight intersects with the Earth ellipsoid
    lon : float
    geodetic longitude where the line-of-sight intersects with the Earth ellipsoid
    d : float
    slant range (meters) from starting point to intersect point

    Values will be NaN if the line of sight does not intersect.

    Algorithm based on https://medium.com/@stephenhartzell/satellite-line-of-sight-intersection-with-earth-d786b4a6a9b6 Stephen Hartzell
    */
    let _, a, b, c, d, e, el, lat, lon, magnitude, n, radical, u, v, value, w, x, y, z;
    if (ell === null) {
        ell = wgs84;
    }
    assert(h0 >= 0, "Intersection calculation requires altitude [0, Infinity)")
    a = ell.semimajor_axis;
    b = ell.semimajor_axis;
    c = ell.semiminor_axis;
    el = (deg ? (tilt - 90.0) : (tilt - (pi / 2)));
    [e, n, u] = aer2enu(az, el, {"srange": 1.0, "deg": deg});
    [u, v, w] = enu2uvw(e, n, u, lat0, lon0, {"deg": deg});
    [x, y, z] = geodetic2ecef(lat0, lon0, h0, {"deg": deg});
    value = ((((((-power(a, 2)) * power(b, 2)) * w) * z) - (((power(a, 2) * power(c, 2)) * v) * y)) - (((power(b, 2) * power(c, 2)) * u) * x));
    radical = (((((((((((((power(a, 2) * power(b, 2)) * power(w, 2)) + ((power(a, 2) * power(c, 2)) * power(v, 2))) - ((power(a, 2) * power(v, 2)) * power(z, 2))) + (((((2 * power(a, 2)) * v) * w) * y) * z)) - ((power(a, 2) * power(w, 2)) * power(y, 2))) + ((power(b, 2) * power(c, 2)) * power(u, 2))) - ((power(b, 2) * power(u, 2)) * power(z, 2))) + (((((2 * power(b, 2)) * u) * w) * x) * z)) - ((power(b, 2) * power(w, 2)) * power(x, 2))) - ((power(c, 2) * power(u, 2)) * power(y, 2))) + (((((2 * power(c, 2)) * u) * v) * x) * y)) - ((power(c, 2) * power(v, 2)) * power(x, 2)));
    magnitude = ((((power(a, 2) * power(b, 2)) * power(w, 2)) + ((power(a, 2) * power(c, 2)) * power(v, 2))) + ((power(b, 2) * power(c, 2)) * power(u, 2)));
    if (radical < 0) {
        radical = nan;
    }
    d = ((value - (((a * b) * c) * sqrt(radical))) / magnitude);
    if (d < 0) {
        d = nan;
    }
    [lat, lon, _] = ecef2geodetic((x + (d * u)), (y + (d * v)), (z + (d * w)), {"deg": deg});
    return [lat, lon, d];
}
