/*  compute radii of auxiliary spheres */

import * as rcurve from './rcurve';
import {cos, degrees, log, power, radians, sin, sqrt} from './mathfun';
import {vdist} from './vincenty';
import {wgs84} from "./ellipsoid";

export {eqavol, authalic, rectifying, euler, curve, triaxial, biaxial};

function eqavol(ell = null) {
    /*computes the radius of the sphere with equal volume as the ellipsoid

    Parameters
    ----------
    ell : Ellipsoid, optional
    reference ellipsoid

    Returns
    -------
    radius: float
    radius of sphere
    */
    let f;
    if (ell === null) {
        ell = wgs84;
    }
    f = ell.flattening;
    return (ell.semimajor_axis * ((1 - (f / 3)) - (power(f, 2) / 9)));
}

function authalic(ell = null) {
    /*computes the radius of the sphere with equal surface area as the ellipsoid

    Parameters
    ----------
    ell : Ellipsoid, optional
    reference ellipsoid

    Returns
    -------
    radius: float
    radius of sphere
    */
    let e, f1, f2, f3;
    if (ell === null) {
        ell = wgs84;
    }
    e = ell.eccentricity;
    if ((e > 0)) {
        f1 = (power(ell.semimajor_axis, 2) / 2);
        f2 = ((1 - power(e, 2)) / (2 * e));
        f3 = log(((1 + e) / (1 - e)));
        return sqrt((f1 * (1 + (f2 * f3))));
    } else {
        return ell.semimajor_axis;
    }
}

function rectifying(ell = null) {
    /*computes the radius of the sphere with equal meridional distances as the ellipsoid

    Parameters
    ----------
    ell : Ellipsoid, optional
    reference ellipsoid

    Returns
    -------
    radius: float
    radius of sphere
    */
    if (ell === null) {
        ell = wgs84;
    }
    return power(((power(ell.semimajor_axis, (3 / 2)) + power(ell.semiminor_axis, (3 / 2))) / 2), (2 / 3));
}

function euler(lat1, lon1, lat2, lon2, ell = null, deg = true) {
    /*computes the Euler radii of curvature at the midpoint of the
    great circle arc defined by the endpoints (lat1,lon1) and (lat2,lon2)

    Parameters
    ----------
    lat1, lat2 : float
    geodetic latitudes (degrees)
    lon1, lon2 : float
    geodetic longitudes (degrees)
    ell : Ellipsoid, optional
    reference ellipsoid
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Returns
    -------
    radius: float
    radius of sphere
    */
    let az, den, latmid, nu, rho;
    if (!deg) {
        [lat1, lon1, lat2, lon2] = [degrees(lat1), degrees(lon1), degrees(lat2), degrees(lon2)];
    }
    latmid = (lat1 + ((lat2 - lat1) / 2));
    az = vdist(lat1, lon1, lat2, lon2, ell)[1];
    rho = rcurve.meridian(latmid, ell, true);
    nu = rcurve.transverse(latmid, ell, true);
    az = radians(az);
    den = ((rho * power(sin(az), 2)) + (nu * power(cos(az), 2)));
    return ((rho * nu) / den);
}

function curve(lat, ell = null, deg = true, method = "mean") {
    /*computes the arithmetic average of the transverse and meridional
    radii of curvature at a specified latitude point

    Parameters
    ----------
    lat1 : float
    geodetic latitudes (degrees)
    ell : Ellipsoid, optional
    reference ellipsoid
    method: str, optional
    "mean" or "norm"
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Returns
    -------
    radius: float
    radius of sphere
    */
    let nu, rho;
    if (deg) {
        lat = radians(lat);
    }
    rho = rcurve.meridian(lat, ell, false);
    nu = rcurve.transverse(lat, ell, false);
    switch (method) {
        case "mean":
            return (rho + nu) / 2;
        case "norm":
            return sqrt(rho * nu);
        default:
            throw new Error("method must be mean or norm");
    }
}

function triaxial(ell = null, method = "mean") {
    /*computes triaxial average of the semimajor and semiminor axes of the ellipsoid

    Parameters
    ----------
    ell : Ellipsoid, optional
    reference ellipsoid
    method: str, optional
    "mean" or "norm"

    Returns
    -------
    radius: float
    radius of sphere
    */
    if (ell === null) {
        ell = wgs84;
    }
    switch (method) {
        case "mean":
            return ((2 * ell.semimajor_axis) + ell.semiminor_axis) / 3;
        case "norm":
            return power((power(ell.semimajor_axis, 2) * ell.semiminor_axis), (1 / 3));
        default:
            throw new Error("method must be mean or norm");
    }
}

function biaxial(ell = null, method = "mean") {
    /*computes biaxial average of the semimajor and semiminor axes of the ellipsoid

    Parameters
    ----------
    ell : Ellipsoid, optional
    reference ellipsoid
    method: str, optional
    "mean" or "norm"

    Returns
    -------
    radius: float
    radius of sphere
    */
    if (ell === null) {
        ell = wgs84;
    }
    switch (method) {
        case "mean":
            return (ell.semimajor_axis + ell.semiminor_axis) / 2;
        case "norm":
            return sqrt((ell.semimajor_axis * ell.semiminor_axis));
        default:
            throw new Error("method must be mean or norm");
    }
}
