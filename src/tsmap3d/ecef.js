/*  Transforms involving ECEF: earth-centered, earth-fixed frame  */

import {atan, atan2, cos, degrees, hypot, pi, power, radians, sin, sqrt, tan} from './mathfun';
import {sanitize} from './utils';
import {ecef2eci, eci2ecef} from './eci';
import {wgs84} from "./ellipsoid";
import {notZero, ZeroDivisionError} from "./funcutils";

export {geodetic2ecef, ecef2geodetic, ecef2enuv, ecef2enu, enu2uvw, uvw2enu, eci2geodetic, geodetic2eci, enu2ecef};

function geodetic2ecef(lat, lon, alt, ell = null, deg = true) {
    /*
    point transformation from Geodetic of specified ellipsoid (default WGS-84) to ECEF

    Parameters
    ----------

    lat
    target geodetic latitude
    lon
    target geodetic longitude
    h
    target altitude above geodetic ellipsoid (meters)
    ell : Ellipsoid, optional
    reference ellipsoid
    deg : bool, optional
    degrees input/output  (False: radians in/out)


    Returns
    -------

    ECEF (Earth centered, Earth fixed)  x,y,z

    x
    target x ECEF coordinate (meters)
    y
    target y ECEF coordinate (meters)
    z
    target z ECEF coordinate (meters)
    */
    let N, x, y, z;
    [lat, ell] = sanitize(lat, ell, deg);
    if (deg) {
        lon = radians(lon);
    }
    N = (power(ell.semimajor_axis, 2) / sqrt(((power(ell.semimajor_axis, 2) * power(cos(lat), 2)) + (power(ell.semiminor_axis, 2) * power(sin(lat), 2)))));
    x = (((N + alt) * cos(lat)) * cos(lon));
    y = (((N + alt) * cos(lat)) * sin(lon));
    z = (((N * power((ell.semiminor_axis / ell.semimajor_axis), 2)) + alt) * sin(lat));
    return [x, y, z];
}

function ecef2geodetic(x, y, z, ell = null, deg = true) {
    /*
    convert ECEF (meters) to geodetic coordinates

    Parameters
    ----------
    x
    target x ECEF coordinate (meters)
    y
    target y ECEF coordinate (meters)
    z
    target z ECEF coordinate (meters)
    ell : Ellipsoid, optional
    reference ellipsoid
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Returns
    -------
    lat
    target geodetic latitude
    lon
    target geodetic longitude
    alt
    target altitude above geodetic ellipsoid (meters)

    based on:
    You, Rey-Jer. (2000). Transformation of Cartesian to Geodetic Coordinates without Iterations.
    Journal of Surveying Engineering. doi: 10.1061/(ASCE)0733-9453
    */
    let Beta, E, Q, alt, cosBeta, dBeta, huE, inside, lat, lim_pi2, lon, r, u;
    if (ell === null) {
        ell = wgs84;
    }
    r = sqrt(((power(x, 2) + power(y, 2)) + power(z, 2)));
    E = sqrt((power(ell.semimajor_axis, 2) - power(ell.semiminor_axis, 2)));
    u = sqrt(((0.5 * (power(r, 2) - power(E, 2))) + (0.5 * sqrt((power((power(r, 2) - power(E, 2)), 2) + ((4 * power(E, 2)) * power(z, 2)))))));
    Q = hypot(x, y);
    huE = hypot(u, E);
    try {
        Beta = atan((((huE / notZero(u)) * z) / notZero(hypot(x, y))));
    } catch (e) {
        if ((e instanceof ZeroDivisionError)) {
            if ((z >= 0)) {
                Beta = (pi / 2);
            } else {
                Beta = ((-pi) / 2);
            }
        } else {
            throw e;
        }
    }
    dBeta = (((((ell.semiminor_axis * u) - (ell.semimajor_axis * huE)) + power(E, 2)) * sin(Beta)) / ((((ell.semimajor_axis * huE)) / cos(Beta)) - (power(E, 2) * cos(Beta))));
    Beta += dBeta;
    lat = atan(((ell.semimajor_axis / ell.semiminor_axis) * tan(Beta)));
    lon = atan2(y, x);
    cosBeta = cos(Beta);
    alt = hypot((z - (ell.semiminor_axis * sin(Beta))), (Q - (ell.semimajor_axis * cosBeta)));
    inside = ((((power(x, 2) / power(ell.semimajor_axis, 2)) + (power(y, 2) / power(ell.semimajor_axis, 2))) + (power(z, 2) / power(ell.semiminor_axis, 2))) < 1);
    if (inside) {
        alt = (-alt);
    }
    if (deg) {
        lat = degrees(lat);
        lon = degrees(lon);
    }
    return [lat, lon, alt];
}

function ecef2enuv(u, v, w, lat0, lon0, deg = true) {
    /*
    VECTOR from observer to target  ECEF => ENU

    Parameters
    ----------
    u
    target x ECEF coordinate (meters)
    v
    target y ECEF coordinate (meters)
    w
    target z ECEF coordinate (meters)
    lat0
    Observer geodetic latitude
    lon0
    Observer geodetic longitude
    h0
    observer altitude above geodetic ellipsoid (meters)
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Returns
    -------
    uEast
    target east ENU coordinate (meters)
    vNorth
    target north ENU coordinate (meters)
    wUp
    target up ENU coordinate (meters)

    */
    let t, uEast, vNorth, wUp;
    if (deg) {
        lat0 = radians(lat0);
        lon0 = radians(lon0);
    }
    t = ((cos(lon0) * u) + (sin(lon0) * v));
    uEast = (((-sin(lon0)) * u) + (cos(lon0) * v));
    wUp = ((cos(lat0) * t) + (sin(lat0) * w));
    vNorth = (((-sin(lat0)) * t) + (cos(lat0) * w));
    return [uEast, vNorth, wUp];
}

function ecef2enu(x, y, z, lat0, lon0, h0, ell = null, deg = true) {
    /*
    from observer to target, ECEF => ENU

    Parameters
    ----------
    x
    target x ECEF coordinate (meters)
    y
    target y ECEF coordinate (meters)
    z
    target z ECEF coordinate (meters)
    lat0
    Observer geodetic latitude
    lon0
    Observer geodetic longitude
    h0
    observer altitude above geodetic ellipsoid (meters)
    ell : Ellipsoid, optional
    reference ellipsoid
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Returns
    -------
    East
    target east ENU coordinate (meters)
    North
    target north ENU coordinate (meters)
    Up
    target up ENU coordinate (meters)

    */
    let x0, y0, z0;
    [x0, y0, z0] = geodetic2ecef(lat0, lon0, h0, ell, deg);
    return uvw2enu((x - x0), (y - y0), (z - z0), lat0, lon0, deg);
}

function enu2uvw(east, north, up, lat0, lon0, deg = true) {
    /*
    Parameters
    ----------

    e1
    target east ENU coordinate (meters)
    n1
    target north ENU coordinate (meters)
    u1
    target up ENU coordinate (meters)

    Results
    -------

    u
    v
    w
    */
    let t, u, v, w;
    if (deg) {
        lat0 = radians(lat0);
        lon0 = radians(lon0);
    }
    t = ((cos(lat0) * up) - (sin(lat0) * north));
    w = ((sin(lat0) * up) + (cos(lat0) * north));
    u = ((cos(lon0) * t) - (sin(lon0) * east));
    v = ((sin(lon0) * t) + (cos(lon0) * east));
    return [u, v, w];
}

function uvw2enu(u, v, w, lat0, lon0, deg = true) {
    /*
    Parameters
    ----------

    u
    v
    w


    Results
    -------

    East
    target east ENU coordinate (meters)
    North
    target north ENU coordinate (meters)
    Up
    target up ENU coordinate (meters)
    */
    let East, North, Up, t;
    if (deg) {
        lat0 = radians(lat0);
        lon0 = radians(lon0);
    }
    t = ((cos(lon0) * u) + (sin(lon0) * v));
    East = (((-sin(lon0)) * u) + (cos(lon0) * v));
    Up = ((cos(lat0) * t) + (sin(lat0) * w));
    North = (((-sin(lat0)) * t) + (cos(lat0) * w));
    return [East, North, Up];
}

function eci2geodetic(x, y, z, t, ell = null, deg = true) {
    /*
    convert Earth Centered Internal ECI to geodetic coordinates

    J2000 time

    Parameters
    ----------
    x
    ECI x-location [meters]
    y
    ECI y-location [meters]
    z
    ECI z-location [meters]
    t : datetime.datetime, float
    UTC time
    ell : Ellipsoid, optional
    planet ellipsoid model
    deg : bool, optional
    if True, degrees. if False, radians

    Results
    -------
    lat
    geodetic latitude
    lon
    geodetic longitude
    alt
    altitude above ellipsoid  (meters)

    eci2geodetic() a.k.a. eci2lla()
    */
    let xecef, yecef, zecef;
    [xecef, yecef, zecef] = eci2ecef(x, y, z, t);
    return ecef2geodetic(xecef, yecef, zecef, ell, deg);
}

function geodetic2eci(lat, lon, alt, t, ell = null, deg = true) {
    /*
    convert geodetic coordinates to Earth Centered Internal ECI

    J2000 frame

    Parameters
    ----------
    lat
    geodetic latitude
    lon
    geodetic longitude
    alt
    altitude above ellipsoid  (meters)
    t : datetime.datetime, float
    UTC time
    ell : Ellipsoid, optional
    planet ellipsoid model
    deg : bool, optional
    if True, degrees. if False, radians

    Results
    -------
    x
    ECI x-location [meters]
    y
    ECI y-location [meters]
    z
    ECI z-location [meters]

    geodetic2eci() a.k.a lla2eci()
    */
    let x, y, z;
    [x, y, z] = geodetic2ecef(lat, lon, alt, ell, deg);
    return ecef2eci(x, y, z, t);
}

function enu2ecef(e1, n1, u1, lat0, lon0, h0, ell = null, deg = true) {
    /*
    ENU to ECEF

    Parameters
    ----------

    e1
    target east ENU coordinate (meters)
    n1
    target north ENU coordinate (meters)
    u1
    target up ENU coordinate (meters)
    lat0
    Observer geodetic latitude
    lon0
    Observer geodetic longitude
    h0
    observer altitude above geodetic ellipsoid (meters)
    ell : Ellipsoid, optional
    reference ellipsoid
    deg : bool, optional
    degrees input/output  (False: radians in/out)


    Results
    -------
    x
    target x ECEF coordinate (meters)
    y
    target y ECEF coordinate (meters)
    z
    target z ECEF coordinate (meters)
    */
    let dx, dy, dz, x0, y0, z0;
    [x0, y0, z0] = geodetic2ecef(lat0, lon0, h0, ell, deg);
    [dx, dy, dz] = enu2uvw(e1, n1, u1, lat0, lon0, deg);
    return [(x0 + dx), (y0 + dy), (z0 + dz)];
}
