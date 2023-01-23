/*  isometric latitude, meridian distance  */

import * as rcurve from './rcurve';
import * as rsphere from './rsphere';
import {
    authalic2geodetic, geodetic2authalic, geodetic2isometric, geodetic2rectifying, rectifying2geodetic
} from './latitude';
import {abs, atan2, cos, degrees, pi, radians, sign, tan, tau} from './mathfun';
import {cart2sph, sph2cart} from './utils';
import {assert} from "./funcutils";

export {loxodrome_inverse, loxodrome_direct, meridian_arc, meridian_dist, departure, meanm};

const COS_EPS = 1e-09;

function meridian_dist(lat, ell = null, deg = true) {
    /*
    Computes the ground distance on an ellipsoid from the equator to the input latitude.

    Parameters
    ----------
    lat : float
    geodetic latitude
    ell : Ellipsoid, optional
    reference ellipsoid (default WGS84)
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Results
    -------
    dist : float
    distance (meters)
    */
    return meridian_arc(0.0, lat, ell, deg);
}

function meridian_arc(lat1, lat2, ell = null, deg = true) {
    /*
    Computes the ground distance on an ellipsoid between two latitudes.

    Parameters
    ----------
    lat1, lat2 : float
    geodetic latitudes
    ell : Ellipsoid, optional
    reference ellipsoid (default WGS84)
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Results
    -------
    dist : float
    distance (meters)
    */
    let rlat1, rlat2;
    if (deg) {
        [lat1, lat2] = [radians(lat1), radians(lat2)];
    }
    rlat1 = geodetic2rectifying(lat1, ell, {"deg": false});
    rlat2 = geodetic2rectifying(lat2, ell, {"deg": false});
    return (rsphere.rectifying(ell) * abs((rlat2 - rlat1)));
}

function loxodrome_inverse(lat1, lon1, lat2, lon2, ell = null, deg = true) {
    /*
    computes the arc length and azimuth of the loxodrome
    between two points on the surface of the reference ellipsoid

    like Matlab distance('rh',...) and azimuth('rh',...)

    Parameters
    ----------

    lat1 : float
    geodetic latitude of first point
    lon1 : float
    geodetic longitude of first point
    lat2 : float
    geodetic latitude of second point
    lon2 : float
    geodetic longitude of second point
    ell : Ellipsoid, optional
    reference ellipsoid (default WGS84)
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Results
    -------

    lox_s : float
    distance along loxodrome (meters)
    az12 : float
    azimuth of loxodrome (degrees/radians)

    Based on Deakin, R.E., 2010, 'The Loxodrome on an Ellipsoid', Lecture Notes,
    School of Mathematical and Geospatial Sciences, RMIT University, January 2010

    [1] Bowring, B.R., 1985, 'The geometry of the loxodrome on the
    ellipsoid', The Canadian Surveyor, Vol. 39, No. 3, Autumn 1985,
    pp.223-230.
    [2] Snyder, J.P., 1987, Map Projections-A Working Manual. U.S.
    Geological Survey Professional Paper 1395. Washington, DC: U.S.
    Government Printing Office, pp.15-16 and pp. 44-45.
    [3] Thomas, P.D., 1952, Conformal Projections in Geodesy and
    Cartography, Special Publication No. 251, Coast and Geodetic
    Survey, U.S. Department of Commerce, Washington, DC: U.S.
    Government Printing Office, p. 66.
    */
    let aux, az12, disolat, dist, dlon;
    if (deg) {
        [lat1, lon1, lat2, lon2] = [radians(lat1), radians(lon1), radians(lat2), radians(lon2)];
    }
    disolat = geodetic2isometric(lat2, ell, {"deg": false}) - geodetic2isometric(lat1, ell, {"deg": false});
    dlon = lon2 - lon1;
    az12 = atan2(dlon, disolat);
    aux = abs(cos(az12));
    dist = meridian_arc(lat2, lat1, ell, {"deg": false}) / aux;
    if (aux < COS_EPS) {
        dist = departure(lon2, lon1, lat1, ell, {"deg": false});
    }
    if (deg) {
        az12 = degrees(az12) % 360.0;
    }
    return [dist, az12];
}

function loxodrome_direct(lat1, lon1, rng, a12, ell = null, deg = true) {
    /*
    Given starting lat, lon with arclength and azimuth, compute final lat, lon

    like Matlab reckon('rh', ...)
    except that "rng" in meters instead of "arclen" degrees of arc

    Parameters
    ----------
    lat1 : float
    inital geodetic latitude (degrees)
    lon1 : float
    initial geodetic longitude (degrees)
    rng : float
    ground distance (meters)
    a12 : float
    azimuth (degrees) clockwide from north.
    ell : Ellipsoid, optional
    reference ellipsoid
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Results
    -------
    lat2 : float
    final geodetic latitude (degrees)
    lon2 : float
    final geodetic longitude (degrees)
    */
    let cosaz, dlon, iso, lat2, lon2, newiso, reclat;
    if (deg) {
        [lat1, lon1, a12] = [radians(lat1), radians(lon1), radians(a12)];
    }
    a12 = a12 % tau;
    assert(abs(lat1) <= (pi / 2), "-90 <= latitude <= 90");
    assert(rng >= 0, "ground distance must be >= 0");
    reclat = geodetic2rectifying(lat1, ell, {"deg": false});
    cosaz = cos(a12);
    lat2 = (reclat + ((rng / rsphere.rectifying(ell)) * cosaz));
    lat2 = rectifying2geodetic(lat2, ell, {"deg": false});
    newiso = geodetic2isometric(lat2, ell, {"deg": false});
    iso = geodetic2isometric(lat1, ell, {"deg": false});
    dlon = (tan(a12) * (newiso - iso));
    if (abs(cos(a12)) < COS_EPS) {
        dlon = ((sign((pi - a12)) * rng) / rcurve.parallel(lat1, ell, {"deg": false}));
    }
    lon2 = (lon1 + dlon);
    if (deg) {
        [lat2, lon2] = [degrees(lat2), degrees(lon2)];
    }
    return [lat2, lon2];
}

function departure(lon1, lon2, lat, ell = null, deg = true) {
    /*
    Computes the distance along a specific parallel between two meridians.

    like Matlab departure()

    Parameters
    ----------
    lon1, lon2 : float
    geodetic longitudes (degrees)
    lat : float
    geodetic latitude (degrees)
    ell : Ellipsoid, optional
    reference ellipsoid
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Returns
    -------
    dist: float
    ground distance (meters)
    */
    if (deg) {
        [lon1, lon2, lat] = [radians(lon1), radians(lon2), radians(lat)];
    }
    return (rcurve.parallel(lat, ell, {"deg": false}) * (abs((lon2 - lon1)) % pi));
}

function meanm(lat, lon, ell = null, deg = true) {
    /*
    Computes geographic mean for geographic points on an ellipsoid

    like Matlab meanm()

    Parameters
    ----------
    lat : sequence of float
    geodetic latitude (degrees)
    lon : sequence of float
    geodetic longitude (degrees)
    ell : Ellipsoid, optional
    reference ellipsoid
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Returns
    -------
    latbar, lonbar: float
    geographic mean latitude, longitude
    */
    let _, latbar, lonbar, x, y, z;
    if (deg) {
        [lat, lon] = [radians(lat), radians(lon)];
    }
    lat = geodetic2authalic(lat, ell, {"deg": false});
    [x, y, z] = sph2cart(lon, lat, array(1.0));
    [lonbar, latbar, _] = cart2sph(x.sum(), y.sum(), z.sum());
    latbar = authalic2geodetic(latbar, ell, {"deg": false});
    if (deg) {
        [latbar, lonbar] = [degrees(latbar), degrees(lonbar)];
    }
    return [latbar, lonbar];
}
