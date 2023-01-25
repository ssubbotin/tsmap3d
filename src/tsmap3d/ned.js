/*  Transforms involving NED North East Down  */

import {ecef2enu, ecef2enuv, ecef2geodetic, enu2ecef} from './ecef';
import {aer2enu, enu2aer, geodetic2enu} from './enu';

export {aer2ned, ned2aer, ned2geodetic, ned2ecef, ecef2ned, geodetic2ned, ecef2nedv}

function aer2ned(az, elev, slantRange, deg = true) {
    /*
    converts azimuth, elevation, range to target from observer to North, East, Down

    Parameters
    -----------

    az : float
    azimuth
    elev : float
    elevation
    slantRange : float
    slant range [meters]
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Results
    -------
    n : float
    North NED coordinate (meters)
    e : float
    East NED coordinate (meters)
    d : float
    Down NED coordinate (meters)
    */
    let e, n, u;
    [e, n, u] = aer2enu(az, elev, slantRange, deg);
    return [n, e, (-u)];
}

function ned2aer(n, e, d, deg = true) {
    /*
    converts North, East, Down to azimuth, elevation, range

    Parameters
    ----------

    n : float
    North NED coordinate (meters)
    e : float
    East NED coordinate (meters)
    d : float
    Down NED coordinate (meters)
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Results
    -------

    az : float
    azimuth
    elev : float
    elevation
    slantRange : float
    slant range [meters]
    */
    return enu2aer(e, n, (-d), deg);
}

function ned2geodetic(n, e, d, lat0, lon0, h0, ell = null, deg = true) {
    /*
    Converts North, East, Down to target latitude, longitude, altitude

    Parameters
    ----------

    n : float
    North NED coordinate (meters)
    e : float
    East NED coordinate (meters)
    d : float
    Down NED coordinate (meters)
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
    target geodetic latitude
    lon : float
    target geodetic longitude
    h : float
    target altitude above geodetic ellipsoid (meters)

    */
    let x, y, z;
    [x, y, z] = enu2ecef(e, n, (-d), lat0, lon0, h0, ell, deg);
    return ecef2geodetic(x, y, z, ell, deg);
}

function ned2ecef(n, e, d, lat0, lon0, h0, ell = null, deg = true) {
    /*
    North, East, Down to target ECEF coordinates

    Parameters
    ----------

    n : float
    North NED coordinate (meters)
    e : float
    East NED coordinate (meters)
    d : float
    Down NED coordinate (meters)
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

    x : float
    ECEF x coordinate (meters)
    y : float
    ECEF y coordinate (meters)
    z : float
    ECEF z coordinate (meters)
    */
    return enu2ecef(e, n, (-d), lat0, lon0, h0, ell, deg);
}

function ecef2ned(x, y, z, lat0, lon0, h0, ell = null, deg = true) {
    /*
    Convert ECEF x,y,z to North, East, Down

    Parameters
    ----------

    x : float
    ECEF x coordinate (meters)
    y : float
    ECEF y coordinate (meters)
    z : float
    ECEF z coordinate (meters)
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

    n : float
    North NED coordinate (meters)
    e : float
    East NED coordinate (meters)
    d : float
    Down NED coordinate (meters)

    */
    let e, n, u;
    [e, n, u] = ecef2enu(x, y, z, lat0, lon0, h0, ell, deg);
    return [n, e, (-u)];
}

function geodetic2ned(lat, lon, h, lat0, lon0, h0, ell = null, deg = true) {
    /*
    convert latitude, longitude, altitude of target to North, East, Down from observer

    Parameters
    ----------

    lat : float
    target geodetic latitude
    lon : float
    target geodetic longitude
    h : float
    target altitude above geodetic ellipsoid (meters)
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

    n : float
    North NED coordinate (meters)
    e : float
    East NED coordinate (meters)
    d : float
    Down NED coordinate (meters)
    */
    let e, n, u;
    [e, n, u] = geodetic2enu(lat, lon, h, lat0, lon0, h0, ell, deg);
    return [n, e, (-u)];
}

function ecef2nedv(x, y, z, lat0, lon0, deg = true) {
    /*
    for VECTOR between two points

    Parameters
    ----------
    x : float
    ECEF x coordinate (meters)
    y : float
    ECEF y coordinate (meters)
    z : float
    ECEF z coordinate (meters)
    lat0 : float
    Observer geodetic latitude
    lon0 : float
    Observer geodetic longitude
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Results
    -------

    (Vector)

    n : float
    North NED coordinate (meters)
    e : float
    East NED coordinate (meters)
    d : float
    Down NED coordinate (meters)
    */
    let e, n, u;
    [e, n, u] = ecef2enuv(x, y, z, lat0, lon0, deg);
    return [n, e, (-u)];
}
