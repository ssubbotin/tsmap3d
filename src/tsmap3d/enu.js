/*  transforms involving ENU East North Up  */

import {ecef2geodetic, enu2ecef, geodetic2ecef, uvw2enu} from './ecef';
import {abs, atan2, cos, degrees, hypot, radians, sin, tau} from './mathfun';
import {assert} from "./funcutils";

export {enu2aer, aer2enu, enu2geodetic, geodetic2enu};

function enu2aer(e, n, u, deg = true) {
    /*
    ENU to Azimuth, Elevation, Range

    Parameters
    ----------

    e : float
    ENU East coordinate (meters)
    n : float
    ENU North coordinate (meters)
    u : float
    ENU Up coordinate (meters)
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Results
    -------

    azimuth : float
    azimuth to rarget
    elevation : float
    elevation to target
    srange : float
    slant range [meters]
    */
    let az, elev, r, slantRange;
    if ((abs(e) < 0.001)) {
        e = 0.0;
    }
    if ((abs(n) < 0.001)) {
        n = 0.0;
    }
    if ((abs(u) < 0.001)) {
        u = 0.0;
    }
    r = hypot(e, n);
    slantRange = hypot(r, u);
    elev = atan2(u, r);
    az = (atan2(e, n) % tau);
    if (deg) {
        az = degrees(az);
        elev = degrees(elev);
    }
    return [az, elev, slantRange];
}

function aer2enu(az, el, srange, deg = true) {
    /*
    Azimuth, Elevation, Slant range to target to East, North, Up

    Parameters
    ----------
    azimuth : float
    azimuth clockwise from north (degrees)
    elevation : float
    elevation angle above horizon, neglecting aberrations (degrees)
    srange : float
    slant range [meters]
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Returns
    --------
    e : float
    East ENU coordinate (meters)
    n : float
    North ENU coordinate (meters)
    u : float
    Up ENU coordinate (meters)
    */
    let r;
    if (deg) {
        el = radians(el);
        az = radians(az);
    }
    assert(srange >= 0, "Slant range [0, Infinity)")
    r = srange * cos(el);
    return [(r * sin(az)), (r * cos(az)), (srange * sin(el))];
}

function enu2geodetic(e, n, u, lat0, lon0, h0, ell = null, deg = true) {
    /*
    East, North, Up to target to geodetic coordinates

    Parameters
    ----------
    e : float
    East ENU coordinate (meters)
    n : float
    North ENU coordinate (meters)
    u : float
    Up ENU coordinate (meters)
    lat0 : float
    Observer geodetic latitude
    lon0 : float
    Observer geodetic longitude
    h0 : float
    observer altitude above geodetic ellipsoid (meters)
    ell : Ellipsoid, optional
    reference ellipsoid
    deg : bool, optional
    degrees input/output  (False: radians in/out)


    Results
    -------
    lat : float
    geodetic latitude
    lon : float
    geodetic longitude
    alt : float
    altitude above ellipsoid  (meters)
    */
    let x, y, z;
    [x, y, z] = enu2ecef(e, n, u, lat0, lon0, h0, ell, {"deg": deg});
    return ecef2geodetic(x, y, z, ell, {"deg": deg});
}

function geodetic2enu(lat, lon, h, lat0, lon0, h0, ell = null, deg = true) {
    /*
    Parameters
    ----------
    lat : float
    target geodetic latitude
    lon : float
    target geodetic longitude
    h : float
    target altitude above ellipsoid  (meters)
    lat0 : float
    Observer geodetic latitude
    lon0 : float
    Observer geodetic longitude
    h0 : float
    observer altitude above geodetic ellipsoid (meters)
    ell : Ellipsoid, optional
    reference ellipsoid
    deg : bool, optional
    degrees input/output  (False: radians in/out)


    Results
    -------
    e : float
    East ENU
    n : float
    North ENU
    u : float
    Up ENU
    */
    let x1, x2, y1, y2, z1, z2;
    [x1, y1, z1] = geodetic2ecef(lat, lon, h, ell, {"deg": deg});
    [x2, y2, z2] = geodetic2ecef(lat0, lon0, h0, ell, {"deg": deg});
    return uvw2enu((x1 - x2), (y1 - y2), (z1 - z2), lat0, lon0, {"deg": deg});
}
