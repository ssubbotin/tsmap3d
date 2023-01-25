/* geodetic transforms to auxilary coordinate systems involving latitude */
import * as rcurve from './rcurve';
import {abs, asinh, atan, atanh, cos, degrees, exp, inf, pi, power, radians, sign, sin, sqrt, tan} from './mathfun';
import {sanitize} from './utils';
import {notZero, ZeroDivisionError} from "./funcutils";

const COS_EPS = 1e-09;

export {
    geodetic2isometric,
    isometric2geodetic,
    geodetic2rectifying,
    rectifying2geodetic,
    geodetic2conformal,
    conformal2geodetic,
    geodetic2parametric,
    parametric2geodetic,
    geodetic2geocentric,
    geocentric2geodetic,
    geodetic2authalic,
    authalic2geodetic,
    geod2geoc,
    geoc2geod
};

function geoc2geod(geocentric_lat, geocentric_distance, ell = null, deg = true) {
    /*
    convert geocentric latitude to geodetic latitude, consider mean sea level altitude

    like Matlab geoc2geod()

    Parameters
    ----------
    geocentric_lat : float
    geocentric latitude
    geocentric_distance: float
    distance from planet center, meters (NOT altitude above ground!)
    ell : Ellipsoid, optional
    reference ellipsoid (default WGS84)
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Returns
    -------
    geodetic_lat : float
    geodetic latiude


    References
    ----------
    Long, S.A.T. "General-Altitude Transformation between Geocentric
    and Geodetic Coordinates. Celestial Mechanics (12), 2, p. 225-230 (1975)
    doi: 10.1007/BF01230214"
    */
    let geodetic_lat, r;
    [geocentric_lat, ell] = sanitize(geocentric_lat, ell, deg);
    r = (geocentric_distance / ell.semimajor_axis);
    geodetic_lat = ((geocentric_lat + ((sin((2 * geocentric_lat)) / r) * ell.flattening)) + ((((1 / power(r, 2)) + (1 / (4 * r))) * sin((4 * geocentric_lat))) * power(ell.flattening, 2)));
    return (deg ? degrees(geodetic_lat) : geodetic_lat);
}

function geodetic2geocentric(geodetic_lat, alt_m, ell = null, deg = true) {
    /*
    convert geodetic latitude to geocentric latitude on spheroid surface

    like Matlab geocentricLatitude() with alt_m = 0
    like Matlab geod2geoc()

    Parameters
    ----------
    geodetic_lat : float
    geodetic latitude
    alt_m: float
    altitude above ellipsoid
    ell : Ellipsoid, optional
    reference ellipsoid (default WGS84)
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Returns
    -------
    geocentric_lat : float
    geocentric latiude

    Notes
    -----
    Equations from J. P. Snyder, "Map Projections - A Working Manual",
    US Geological Survey Professional Paper 1395, US Government Printing
    Office, Washington, DC, 1987, pp. 13-18.
    */
    let geocentric_lat, r;
    [geodetic_lat, ell] = sanitize(geodetic_lat, ell, deg);
    r = rcurve.transverse(geodetic_lat, ell, false);
    geocentric_lat = atan(((1 - (power(ell.eccentricity, 2) * (r / (r + alt_m)))) * tan(geodetic_lat)));
    return (deg ? degrees(geocentric_lat) : geocentric_lat);
}

const geod2geoc = geodetic2geocentric;

function geocentric2geodetic(geocentric_lat, alt_m, ell = null, deg = true) {
    /*
    converts from geocentric latitude to geodetic latitude

    like Matlab geodeticLatitudeFromGeocentric() when alt_m = 0
    like Matlab geod2geoc() but with sea level altitude rather than planet center distance

    Parameters
    ----------
    geocentric_lat : float
    geocentric latitude
    alt_m: float
    altitude above ellipsoid
    ell : Ellipsoid, optional
    reference ellipsoid (default WGS84)
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Returns
    -------
    geodetic_lat : float
    geodetic latiude

    Notes
    -----
    Equations from J. P. Snyder, "Map Projections - A Working Manual",
    US Geological Survey Professional Paper 1395, US Government Printing
    Office, Washington, DC, 1987, pp. 13-18.
    */
    let geodetic_lat, r;
    [geocentric_lat, ell] = sanitize(geocentric_lat, ell, deg);
    r = rcurve.transverse(geocentric_lat, ell, false);
    geodetic_lat = atan((tan(geocentric_lat) / (1 - (power(ell.eccentricity, 2) * (r / (r + alt_m))))));
    return (deg ? degrees(geodetic_lat) : geodetic_lat);
}

function geodetic2isometric(geodetic_lat, ell = null, deg = true) {
    /*
    computes isometric latitude on an ellipsoid


    like Matlab map.geodesy.IsometricLatitudeConverter.forward()

    Parameters
    ----------
    lat : float
    geodetic latitude
    ell : Ellipsoid, optional
    reference ellipsoid (default WGS84)
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Returns
    -------
    isolat : float
    isometric latiude

    Notes
    -----
    Isometric latitude is an auxiliary latitude proportional to the spacing
    of parallels of latitude on an ellipsoidal mercator projection.
    Based on Deakin, R.E., 2010, 'The Loxodrome on an Ellipsoid', Lecture Notes,
    School of Mathematical and Geospatial Sciences, RMIT University,
    January 2010
    */
    let coslat, e, isometric_lat;
    [geodetic_lat, ell] = sanitize(geodetic_lat, ell, deg);
    e = ell.eccentricity;
    isometric_lat = (asinh(tan(geodetic_lat)) - (e * atanh((e * sin(geodetic_lat)))));
    coslat = cos(geodetic_lat);
    if (abs(coslat) <= COS_EPS) {
        isometric_lat = (sign(geodetic_lat) * inf);
    }
    if (deg) {
        isometric_lat = degrees(isometric_lat);
    }
    return isometric_lat;
}

function isometric2geodetic(isometric_lat, ell = null, deg = true) {
    /*
    converts from isometric latitude to geodetic latitude

    like Matlab map.geodesy.IsometricLatitudeConverter.inverse()

    Parameters
    ----------
    isometric_lat : float
    isometric latitude
    ell : Ellipsoid, optional
    reference ellipsoid (default WGS84)
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Returns
    -------
    geodetic_lat : float
    geodetic latiude

    Notes
    -----
    Equations from J. P. Snyder, "Map Projections - A Working Manual",
    US Geological Survey Professional Paper 1395, US Government Printing
    Office, Washington, DC, 1987, pp. 13-18.
    */
    let conformal_lat, geodetic_lat;
    if (deg) {
        isometric_lat = radians(isometric_lat);
    }
    conformal_lat = ((2 * atan(exp(isometric_lat))) - (pi / 2));
    geodetic_lat = conformal2geodetic(conformal_lat, ell, false);
    return (deg ? degrees(geodetic_lat) : geodetic_lat);
}

function conformal2geodetic(conformal_lat, ell = null, deg = true) {
    /*
    converts from conformal latitude to geodetic latitude

    like Matlab map.geodesy.ConformalLatitudeConverter.inverse()

    Parameters
    ----------
    conformal_lat : float
    conformal latitude
    ell : Ellipsoid, optional
    reference ellipsoid (default WGS84)
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Returns
    -------
    geodetic_lat : float
    geodetic latiude

    Notes
    -----
    Equations from J. P. Snyder, "Map Projections - A Working Manual",
    US Geological Survey Professional Paper 1395, US Government Printing
    Office, Washington, DC, 1987, pp. 13-18.
    */
    let e, f1, f2, f3, f4, geodetic_lat;
    [conformal_lat, ell] = sanitize(conformal_lat, ell, deg);
    e = ell.eccentricity;
    f1 = ((((power(e, 2) / 2) + ((5 * power(e, 4)) / 24)) + (power(e, 6) / 12)) + ((13 * power(e, 8)) / 360));
    f2 = ((((7 * power(e, 4)) / 48) + ((29 * power(e, 6)) / 240)) + ((811 * power(e, 8)) / 11520));
    f3 = (((7 * power(e, 6)) / 120) + ((81 * power(e, 8)) / 1120));
    f4 = ((4279 * power(e, 8)) / 161280);
    geodetic_lat = ((((conformal_lat + (f1 * sin((2 * conformal_lat)))) + (f2 * sin((4 * conformal_lat)))) + (f3 * sin((6 * conformal_lat)))) + (f4 * sin((8 * conformal_lat))));
    return (deg ? degrees(geodetic_lat) : geodetic_lat);
}

function geodetic2conformal(geodetic_lat, ell = null, deg = true) {
    /*
    converts from geodetic latitude to conformal latitude

    like Matlab map.geodesy.ConformalLatitudeConverter.forward()

    Parameters
    ----------
    geodetic_lat : float
    geodetic latitude
    ell : Ellipsoid, optional
    reference ellipsoid (default WGS84)
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Returns
    -------
    conformal_lat : float
    conformal latiude

    Notes
    -----
    Equations from J. P. Snyder, "Map Projections - A Working Manual",
    US Geological Survey Professional Paper 1395, US Government Printing
    Office, Washington, DC, 1987, pp. 13-18.

    */
    let conformal_lat, e, f1, f2, f3, f4;
    [geodetic_lat, ell] = sanitize(geodetic_lat, ell, deg);
    e = ell.eccentricity;
    f1 = (1 - (e * sin(geodetic_lat)));
    f2 = (1 + (e * sin(geodetic_lat)));
    f3 = (1 - sin(geodetic_lat));
    f4 = (1 + sin(geodetic_lat));
    try {
        conformal_lat = ((2 * atan(sqrt(((f4 / notZero(f3)) * power((f1 / notZero(f2)), e))))) - (pi / 2));
    } catch (e) {
        if ((e instanceof ZeroDivisionError)) {
            conformal_lat = (pi / 2);
        } else {
            throw e;
        }
    }
    return (deg ? degrees(conformal_lat) : conformal_lat);
}

function geodetic2rectifying(geodetic_lat, ell = null, deg = true) {
    /*
    converts from geodetic latitude to rectifying latitude

    like Matlab map.geodesy.RectifyingLatitudeConverter.forward()

    Parameters
    ----------
    geodetic_lat : float
    geodetic latitude
    ell : Ellipsoid, optional
    reference ellipsoid (default WGS84)
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Returns
    -------
    rectifying_lat : float
    rectifying latiude

    Notes
    -----
    Equations from J. P. Snyder, "Map Projections - A Working Manual",
    US Geological Survey Professional Paper 1395, US Government Printing
    Office, Washington, DC, 1987, pp. 13-18.

    */
    let f1, f2, f3, f4, n, rectifying_lat;
    [geodetic_lat, ell] = sanitize(geodetic_lat, ell, deg);
    n = ell.thirdflattening;
    f1 = (((3 * n) / 2) - ((9 * power(n, 3)) / 16));
    f2 = (((15 * power(n, 2)) / 16) - ((15 * power(n, 4)) / 32));
    f3 = ((35 * power(n, 3)) / 48);
    f4 = ((315 * power(n, 4)) / 512);
    rectifying_lat = ((((geodetic_lat - (f1 * sin((2 * geodetic_lat)))) + (f2 * sin((4 * geodetic_lat)))) - (f3 * sin((6 * geodetic_lat)))) + (f4 * sin((8 * geodetic_lat))));
    return (deg ? degrees(rectifying_lat) : rectifying_lat);
}

function rectifying2geodetic(rectifying_lat, ell = null, deg = true) {
    /*
    converts from rectifying latitude to geodetic latitude

    like Matlab map.geodesy.RectifyingLatitudeConverter.inverse()

    Parameters
    ----------
    rectifying_lat : float
    latitude
    ell : Ellipsoid, optional
    reference ellipsoid (default WGS84)
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Returns
    -------
    geodetic_lat : float
    geodetic latiude

    Notes
    -----
    Equations from J. P. Snyder, "Map Projections - A Working Manual",
    US Geological Survey Professional Paper 1395, US Government Printing
    Office, Washington, DC, 1987, pp. 13-18.
    */
    let f1, f2, f3, f4, geodetic_lat, n;
    [rectifying_lat, ell] = sanitize(rectifying_lat, ell, deg);
    n = ell.thirdflattening;
    f1 = (((3 * n) / 2) - ((27 * power(n, 3)) / 32));
    f2 = (((21 * power(n, 2)) / 16) - ((55 * power(n, 4)) / 32));
    f3 = ((151 * power(n, 3)) / 96);
    f4 = ((1097 * power(n, 4)) / 512);
    geodetic_lat = ((((rectifying_lat + (f1 * sin((2 * rectifying_lat)))) + (f2 * sin((4 * rectifying_lat)))) + (f3 * sin((6 * rectifying_lat)))) + (f4 * sin((8 * rectifying_lat))));
    return (deg ? degrees(geodetic_lat) : geodetic_lat);
}

function geodetic2authalic(geodetic_lat, ell = null, deg = true) {
    /*
    converts from geodetic latitude to authalic latitude

    like Matlab map.geodesy.AuthalicLatitudeConverter.forward()

    Parameters
    ----------
    geodetic_lat : float
    geodetic latitude
    ell : Ellipsoid, optional
    reference ellipsoid (default WGS84)
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Returns
    -------
    authalic_lat : float
    authalic latiude

    Notes
    -----
    Equations from J. P. Snyder, "Map Projections - A Working Manual",
    US Geological Survey Professional Paper 1395, US Government Printing
    Office, Washington, DC, 1987, pp. 13-18.

    */
    let authalic_lat, e, f1, f2, f3;
    [geodetic_lat, ell] = sanitize(geodetic_lat, ell, deg);
    e = ell.eccentricity;
    f1 = (((power(e, 2) / 3) + ((31 * power(e, 4)) / 180)) + ((59 * power(e, 6)) / 560));
    f2 = (((17 * power(e, 4)) / 360) + ((61 * power(e, 6)) / 1260));
    f3 = ((383 * power(e, 6)) / 45360);
    authalic_lat = (((geodetic_lat - (f1 * sin((2 * geodetic_lat)))) + (f2 * sin((4 * geodetic_lat)))) - (f3 * sin((6 * geodetic_lat))));
    return (deg ? degrees(authalic_lat) : authalic_lat);
}

function authalic2geodetic(authalic_lat, ell = null, deg = true) {
    /*
    converts from authalic latitude to geodetic latitude

    like Matlab map.geodesy.AuthalicLatitudeConverter.inverse()

    Parameters
    ----------
    authalic_lat : float
    latitude
    ell : Ellipsoid, optional
    reference ellipsoid (default WGS84)
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Returns
    -------
    geodetic_lat : float
    geodetic latiude

    Notes
    -----
    Equations from J. P. Snyder, "Map Projections - A Working Manual",
    US Geological Survey Professional Paper 1395, US Government Printing
    Office, Washington, DC, 1987, pp. 13-18.
    */
    let e, f1, f2, f3, geodetic_lat;
    [authalic_lat, ell] = sanitize(authalic_lat, ell, deg);
    e = ell.eccentricity;
    f1 = (((power(e, 2) / 3) + ((31 * power(e, 4)) / 180)) + ((517 * power(e, 6)) / 5040));
    f2 = (((23 * power(e, 4)) / 360) + ((251 * power(e, 6)) / 3780));
    f3 = ((761 * power(e, 6)) / 45360);
    geodetic_lat = (((authalic_lat + (f1 * sin((2 * authalic_lat)))) + (f2 * sin((4 * authalic_lat)))) + (f3 * sin((6 * authalic_lat))));
    return (deg ? degrees(geodetic_lat) : geodetic_lat);
}

function geodetic2parametric(geodetic_lat, ell = null, deg = true) {
    /*
    converts from geodetic latitude to parametric latitude

    like Matlab parametriclatitude()

    Parameters
    ----------
    geodetic_lat : float
    geodetic latitude
    ell : Ellipsoid, optional
    reference ellipsoid (default WGS84)
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Returns
    -------
    parametric_lat : float
    parametric latiude

    Notes
    -----
    Equations from J. P. Snyder, "Map Projections - A Working Manual",
    US Geological Survey Professional Paper 1395, US Government Printing
    Office, Washington, DC, 1987, pp. 13-18.

    */
    let parametric_lat;
    [geodetic_lat, ell] = sanitize(geodetic_lat, ell, deg);
    parametric_lat = atan((sqrt((1 - power(ell.eccentricity, 2))) * tan(geodetic_lat)));
    return (deg ? degrees(parametric_lat) : parametric_lat);
}

function parametric2geodetic(parametric_lat, ell = null, deg = true) {
    /*
    converts from parametric latitude to geodetic latitude

    like Matlab geodeticLatitudeFromParametric()

    Parameters
    ----------
    parametric_lat : float
    latitude
    ell : Ellipsoid, optional
    reference ellipsoid (default WGS84)
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Returns
    -------
    geodetic_lat : float
    geodetic latiude

    Notes
    -----
    Equations from J. P. Snyder, "Map Projections - A Working Manual",
    US Geological Survey Professional Paper 1395, US Government Printing
    Office, Washington, DC, 1987, pp. 13-18.
    */
    let geodetic_lat;
    [parametric_lat, ell] = sanitize(parametric_lat, ell, deg);
    geodetic_lat = atan((tan(parametric_lat) / sqrt((1 - power(ell.eccentricity, 2)))));
    return (deg ? degrees(geodetic_lat) : geodetic_lat);
}
