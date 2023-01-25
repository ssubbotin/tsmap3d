/* compute radii of curvature for an ellipsoid */

import {cos, power, sin, sqrt} from './mathfun';
import {sanitize} from './utils';

export {parallel, meridian, transverse, geocentric_radius};

function geocentric_radius(geodetic_lat, ell = null, deg = true) {
    /*
    compute geocentric radius at geodetic latitude

    https://en.wikipedia.org/wiki/Earth_radius#Geocentric_radius
    */
    [geodetic_lat, ell] = sanitize(geodetic_lat, ell, deg);
    return sqrt((
        (power((power(ell.semimajor_axis, 2) * cos(geodetic_lat)), 2) + power((power(ell.semiminor_axis, 2) * sin(geodetic_lat)), 2))
        /
        (power((ell.semimajor_axis * cos(geodetic_lat)), 2) + power((ell.semiminor_axis * sin(geodetic_lat)), 2))
    ));
}

function parallel(lat, ell = null, deg = true) {
    /*
    computes the radius of the small circle encompassing the globe at the specified latitude

    like Matlab rcurve('parallel', ...)

    Parameters
    ----------
    lat : float
    geodetic latitude (degrees)
    ell : Ellipsoid, optional
    reference ellipsoid
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Returns
    -------
    radius: float
    radius of ellipsoid (meters)
    */
    [lat, ell] = sanitize(lat, ell, deg);
    return (cos(lat) * transverse(lat, ell, false));
}

function meridian(lat, ell = null, deg = true) {
    /*computes the meridional radius of curvature for the ellipsoid

    like Matlab rcurve('meridian', ...)

    Parameters
    ----------
    lat : float
    geodetic latitude (degrees)
    ell : Ellipsoid, optional
    reference ellipsoid
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Returns
    -------
    radius: float
    radius of ellipsoid
    */
    let f1, f2;
    [lat, ell] = sanitize(lat, ell, deg);
    f1 = (ell.semimajor_axis * (1 - power(ell.eccentricity, 2)));
    f2 = (1 - power((ell.eccentricity * sin(lat)), 2));
    return (f1 / sqrt(power(f2, 3)));
}

function transverse(lat, ell = null, deg = true) {
    /*computes the radius of the curve formed by a plane
    intersecting the ellipsoid at the latitude which is
    normal to the surface of the ellipsoid

    like Matlab rcurve('transverse', ...)

    Parameters
    ----------
    lat : float
    latitude (degrees)
    ell : Ellipsoid, optional
    reference ellipsoid
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Returns
    -------
    radius: float
    radius of ellipsoid (meters)
    */
    [lat, ell] = sanitize(lat, ell, deg);
    return (ell.semimajor_axis / sqrt((1 - power((ell.eccentricity * sin(lat)), 2))));
}
