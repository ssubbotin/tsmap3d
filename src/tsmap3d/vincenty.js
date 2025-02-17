/*
Vincenty's methods for computing ground distance and reckoning
*/
import {abs, asin, atan, atan2, cos, degrees, isnan, nan, pi, power, radians, sign, sin, sqrt, tan} from './mathfun';
import {wgs84} from "./ellipsoid";
import {assert, notZero, range, ZeroDivisionError} from "./funcutils";

export {vdist, vreckon, track2};

function vdist(Lat1, Lon1, Lat2, Lon2, ell = null) {
    /*
    Using the reference ellipsoid, compute the distance between two points
    within a few millimeters of accuracy, compute forward azimuth,
    and compute backward azimuth, all using a vectorized version of
    Vincenty's algorithm:

    Example:

    dist_m, azimuth_deg = vdist(lat1, lon1, lat2, lon2, ell)

    Parameters
    ----------

    Lat1 : float
    Geodetic latitude of first point (degrees)
    Lon1 : float
    Geodetic longitude of first point (degrees)
    Lat2 : float
    Geodetic latitude of second point (degrees)
    Lon2 : float
    Geodetic longitude of second point (degrees)
    ell : Ellipsoid, optional
    reference ellipsoid

    Results
    -------

    dist_m : float
    distance (meters)
    az : float
    azimuth (degrees) clockwise from first point to second point (forward)



    Original algorithm source:
    T. Vincenty, "Direct and Inverse Solutions of Geodesics on the Ellipsoid
    with Application of Nested Equations", Survey Review, vol. 23, no. 176,
    April 1975, pp 88-93.
    Available at: http://www.ngs.noaa.gov/PUBS_LIB/inverse.pdf

    Notes:

    1. lat1,lon1,lat2,lon2 can be any (identical) size/shape. Outputs will have the same size and shape.
    2. Error correcting code, convergence failure traps, antipodal corrections, polar error corrections, WGS84 ellipsoid parameters, testing, and comments: Michael Kleder, 2004.
    3. Azimuth implementation (including quadrant abiguity resolution) and code vectorization, Michael Kleder, Sep 2005.
    4. Vectorization is convergence sensitive; that is, quantities which have already converged to within tolerance are not recomputed during subsequent iterations (while other quantities are still converging).
    5. Vincenty describes his distance algorithm as precise to within 0.01 millimeters, subject to the ellipsoidal model.
    6. For distance calculations, essentially antipodal points are treated as exactly antipodal, potentially reducing accuracy slightly.
    7. Distance failures for points exactly at the poles are eliminated by moving the points by 0.6 millimeters.
    8. The Vincenty distance algorithm was transcribed verbatim by Peter Cederholm, August 12, 2003. It was modified and translated to English by Michael Kleder. Mr. Cederholm's website is http://www.plan.aau.dk/~pce/
    9. Distances agree with the Mapping Toolbox, version 2.2 (R14SP3) with a max relative difference of about 5e-9, except when the two points are nearly antipodal, and except when one point is near the equator and the two longitudes are nearly 180 degrees apart. This function (vdist) is more accurate in such cases.
    For example, note this difference (as of this writing):

    vdist(0.2,305,15,125) > 18322827.0131551
    distance(0.2,305,15,125,[6378137 0.08181919]) > 0

    10. Azimuths FROM the north pole (either forward starting at the north pole or backward when ending at the north pole) are set to 180 degrees by convention.
    Azimuths FROM the south pole are set to 0 degrees by convention.
    11. Azimuths agree with the Mapping Toolbox, version 2.2 (R14SP3) to within about a hundred-thousandth of a degree, except when traversing to or from a pole, where the convention for this function is described in (10), and except in the cases noted above in (9).
    12. No warranties; use at your own risk.
    */
    let A, B, C, L, U1, U2, a, a12, alpha, az, b, cos2sigmam, cossigma, deltasigma, denom, dist_m, f, itercount,
        lamb, lambdaold, lat1, lat2, lon1, lon2, notdone, numer, sigma, sinAlpha, sinsigma, u2, warninggiven;
    if (ell === null) {
        ell = wgs84;
    }
    assert((abs(Lat1) <= 90) && (abs(Lat2) <= 90), "Input latitudes must be in [-90, 90] degrees.");
    a = ell.semimajor_axis;
    b = ell.semiminor_axis;
    f = ell.flattening;
    lat1 = radians(Lat1);
    lon1 = radians(Lon1);
    lat2 = radians(Lat2);
    lon2 = radians(Lon2);
    if ((abs(((pi / 2) - abs(lat1))) < 1e-10)) {
        lat1 = (sign(lat1) * ((pi / 2) - 1e-10));
    }
    if ((abs(((pi / 2) - abs(lat2))) < 1e-10)) {
        lat2 = (sign(lat2) * ((pi / 2) - 1e-10));
    }
    U1 = atan(((1 - f) * tan(lat1)));
    U2 = atan(((1 - f) * tan(lat2)));
    lon1 = (lon1 % (2 * pi));
    lon2 = (lon2 % (2 * pi));
    L = abs((lon2 - lon1));
    if ((L > pi)) {
        L = ((2 * pi) - L);
    }
    lamb = L;
    itercount = 0;
    warninggiven = false;
    notdone = true;
    while (notdone) {
        itercount += 1;
        if ((itercount > 50)) {
            if ((!warninggiven)) {
                console.warn("Essentially antipodal points encountered. Precision may be reduced slightly.");
            }
            lamb = pi;
            break;
        }
        lambdaold = lamb;
        sinsigma = sqrt((power((cos(U2) * sin(lamb)), 2) + power(((cos(U1) * sin(U2)) - ((sin(U1) * cos(U2)) * cos(lamb))), 2)));
        cossigma = ((sin(U1) * sin(U2)) + ((cos(U1) * cos(U2)) * cos(lamb)));
        sinsigma = sinsigma.real;
        cossigma = cossigma.real;
        sigma = atan2(sinsigma, cossigma);
        try {
            sinAlpha = (((cos(U1) * cos(U2)) * sin(lamb)) / notZero(sin(sigma)));
        } catch (e) {
            if ((e instanceof ZeroDivisionError)) {
                sinAlpha = 0.0;
            } else {
                throw e;
            }
        }
        if (isnan(sinAlpha)) {
            alpha = 0.0;
        } else {
            if (((sinAlpha > 1) || (abs((sinAlpha - 1)) < 1e-16))) {
                alpha = (pi / 2);
            } else {
                alpha = asin(sinAlpha);
            }
        }
        cos2sigmam = (cos(sigma) - (((2 * sin(U1)) * sin(U2)) / power(cos(alpha), 2)));
        C = (((f / 16) * power(cos(alpha), 2)) * (4 + (f * (4 - (3 * power(cos(alpha), 2))))));
        lamb = (L + ((((1 - C) * f) * sin(alpha)) * (sigma + ((C * sin(sigma)) * (cos2sigmam + ((C * cos(sigma)) * ((-1) + (2.0 * power(cos2sigmam, 2)))))))));
        if (lamb > pi) {
            console.warn("Essentially antipodal points encountered. Precision may be reduced slightly.");
            warninggiven = true;
            lambdaold = pi;
            lamb = pi;
        }
        notdone = (abs((lamb - lambdaold)) > 1e-12);
    }
    u2 = ((power(cos(alpha), 2) * (power(a, 2) - power(b, 2))) / power(b, 2));
    A = (1 + ((u2 / 16384) * (4096 + (u2 * ((-768) + (u2 * (320 - (175 * u2))))))));
    B = ((u2 / 1024) * (256 + (u2 * ((-128) + (u2 * (74 - (47 * u2)))))));
    deltasigma = ((B * sin(sigma)) * (cos2sigmam + ((B / 4) * ((cos(sigma) * ((-1) + (2 * power(cos2sigmam, 2)))) - ((((B / 6) * cos2sigmam) * ((-3) + (4 * power(sin(sigma), 2)))) * ((-3) + (4 * power(cos2sigmam, 2))))))));
    dist_m = ((b * A) * (sigma - deltasigma));
    lamb = abs(lamb);
    if (((sign(sin((lon2 - lon1))) * sign(sin(lamb))) < 0)) {
        lamb = (-lamb);
    }
    numer = (cos(U2) * sin(lamb));
    denom = ((cos(U1) * sin(U2)) - ((sin(U1) * cos(U2)) * cos(lamb)));
    a12 = atan2(numer, denom);
    a12 %= (2 * pi);
    az = degrees(a12);
    return [dist_m, az];
}

function vreckon(Lat1, Lon1, Rng, Azim, ell = null) {
    /*
    This is the Vincenty "forward" solution.

    Computes points at a specified azimuth and range in an ellipsoidal earth.
    Using the reference ellipsoid, travel a given distance along a given azimuth starting at a given initial point,
    and return the endpoint within a few millimeters of accuracy, using Vincenty's algorithm.

    Example:

    lat2, lon2 = vreckon(lat1, lon1, ground_range_m, azimuth_deg)

    Parameters
    ----------

    Lat1 : float
    inital geodetic latitude (degrees)
    Lon1 : float
    initial geodetic longitude (degrees)
    Rng : float
    ground distance (meters)
    Azim : float
    intial azimuth (degrees) clockwide from north.
    ell : Ellipsoid, optional
    reference ellipsoid

    Results
    -------

    Lat2 : float
    final geodetic latitude (degrees)
    Lon2 : float
    final geodetic longitude (degrees)


    Original algorithm: T. Vincenty, "Direct and Inverse Solutions of Geodesics on the Ellipsoid with Application of Nested Equations", Survey Review, vol. 23, no. 176, April 1975, pp 88-93. http://www.ngs.noaa.gov/PUBS_LIB/inverse.pdf

    Notes:

    1. The Vincenty reckoning algorithm was transcribed verbatim into JavaScript by Chris Veness.
    It was modified and translated to Matlab by Michael Kleder.
    Mr. Veness's website is: http://www.movable-type.co.uk/scripts/latlong-vincenty-direct.html
    2. Error correcting code, polar error corrections, WGS84 ellipsoid parameters, testing, and comments by Michael Kleder.
    3. By convention, when starting at a pole, the longitude of the initial point (otherwise meaningless) determines the longitude line along which to traverse, and hence the longitude of the final point.
    4. The convention noted in (3) above creates a discrepancy with VDIST when the the intial or final point is at a pole. In the VDIST
    function, when traversing from a pole, the azimuth is  0 when
    heading away from the south pole and 180 when heading away from the north pole. In contrast, this VRECKON function uses the azimuth as noted in (3) above when traversing away form a pole.
    5. In testing, where the traversal subtends no more than 178 degrees, this function correctly inverts the VDIST function to within 0.2 millimeters of distance, 5e-10 degrees of forward azimuth,
    and 5e-10 degrees of reverse azimuth. Precision reduces as test
    points approach antipodal because the precision of VDIST is reduced
    for nearly antipodal points. (A warning is given by VDIST.)
    6. Tested but no warranty. Use at your own risk.
    7. Ver 1.0, Michael Kleder, November 2007. Ver 2.0, Joaquim Luis, September 2008

    Added ellipsoid and vectorized whenever possible. Also, lon2 is always converted to the [-180 180] interval.
    Joaquim Luis
    */
    let A, B, C, L, a, alpha1, b, cos2SigmaM, cosAlpha1, cosSigma, cosSqAlpha, cosU1, deltaSigma, f, i, lamb, lat1,
        lat2, lon1, lon2, sigma, sigma1, sigmaP, sinAlpha, sinAlpha1, sinSigma, sinU1, tanU1, tmp, uSq;

    assert(abs(Lat1) <= 90.0, "Input lat. must be between -90 and 90 deg., inclusive.");
    assert(Rng >= 0.0, "Ground distance must be positive");

    if (ell === null) {
        ell = wgs84;
    }
    a = ell.semimajor_axis;
    b = ell.semiminor_axis;
    f = ell.flattening;

    lat1 = radians(Lat1);
    lon1 = radians(Lon1);
    if (abs(((pi / 2) - abs(lat1))) < 1e-10) {
        lat1 = (sign(lat1) * ((pi / 2) - 1e-10));
    }
    alpha1 = radians(Azim);
    sinAlpha1 = sin(alpha1);
    cosAlpha1 = cos(alpha1);
    tanU1 = ((1 - f) * tan(lat1));
    cosU1 = (1 / sqrt((1 + power(tanU1, 2))));
    sinU1 = (tanU1 * cosU1);
    sigma1 = atan2(tanU1, cosAlpha1);
    sinAlpha = (cosU1 * sinAlpha1);
    cosSqAlpha = (1 - (sinAlpha * sinAlpha));
    uSq = ((cosSqAlpha * (power(a, 2) - power(b, 2))) / power(b, 2));
    A = (1 + ((uSq / 16384) * (4096 + (uSq * ((-768) + (uSq * (320 - (175 * uSq))))))));
    B = ((uSq / 1024) * (256 + (uSq * ((-128) + (uSq * (74 - (47 * uSq)))))));
    sigma = (Rng / (b * A));
    sigmaP = 2 * pi;
    sinSigma = nan;
    cosSigma = nan;
    cos2SigmaM = nan;
    i = abs((sigma - sigmaP)) > 1e-12;
    while (i) {
        cos2SigmaM = cos(((2 * sigma1) + sigma));
        sinSigma = sin(sigma);
        cosSigma = cos(sigma);
        deltaSigma = ((B * sinSigma) * (cos2SigmaM + ((B / 4) * ((cosSigma * ((-1) + ((2 * cos2SigmaM) * cos2SigmaM))) - ((((B / 6) * cos2SigmaM) * ((-3) + ((4 * sinSigma) * sinSigma))) * ((-3) + ((4 * cos2SigmaM) * cos2SigmaM)))))));
        sigmaP = sigma;
        sigma = ((Rng / (b * A)) + deltaSigma);
        i = abs((sigma - sigmaP)) > 1e-12;
    }
    tmp = ((sinU1 * sinSigma) - ((cosU1 * cosSigma) * cosAlpha1));
    lat2 = atan2(((sinU1 * cosSigma) + ((cosU1 * sinSigma) * cosAlpha1)), ((1 - f) * sqrt(((sinAlpha * sinAlpha) + power(tmp, 2)))));
    lamb = atan2((sinSigma * sinAlpha1), ((cosU1 * cosSigma) - ((sinU1 * sinSigma) * cosAlpha1)));
    C = (((f / 16) * cosSqAlpha) * (4 + (f * (4 - (3 * cosSqAlpha)))));
    L = (lamb - (((f * (1 - C)) * sinAlpha) * (sigma + ((C * sinSigma) * (cos2SigmaM + ((C * cosSigma) * ((-1) + ((2 * cos2SigmaM) * cos2SigmaM))))))));
    lon2 = degrees((lon1 + L));
    lon2 = (lon2 % 360);
    return [degrees(lat2), lon2];
}

function track2(lat1, lon1, lat2, lon2, ell = null, npts = 100, deg = true) {
    /*
    computes great circle tracks starting at the point lat1, lon1 and ending at lat2, lon2

    Parameters
    ----------

    Lat1 : float
    Geodetic latitude of first point (degrees)
    Lon1 : float
    Geodetic longitude of first point (degrees)
    Lat2 : float
    Geodetic latitude of second point (degrees)
    Lon2 : float
    Geodetic longitude of second point (degrees)
    ell : Ellipsoid, optional
    reference ellipsoid
    npts : int, optional
    number of points (default is 100)
    deg : bool, optional
    degrees input/output  (False: radians in/out)

    Results
    -------

    lats : list of float
    latitudes of points along track
    lons : list of float
    longitudes of points along track

    Based on code posted to the GMT mailing list in Dec 1999 by Jim Levens and by Jeff Whitaker <jeffrey.s.whitaker@noaa.gov>
    */
    let azimuth, distance, gcarclen, incdist, latpt, latptnew, lats, lonpt, lonptnew, lons, rlat1, rlat2, rlon1, rlon2;
    if (ell === null) {
        ell = wgs84;
    }
    assert(npts > 1, "npts must be greater than 1");

    if ((npts === 2)) {
        return [[lat1, lat2], [lon1, lon2]];
    }
    if (deg) {
        rlat1 = radians(lat1);
        rlon1 = radians(lon1);
        rlat2 = radians(lat2);
        rlon2 = radians(lon2);
    } else {
        [rlat1, rlon1, rlat2, rlon2] = [lat1, lon1, lat2, lon2];
    }
    gcarclen = (2.0 * asin(sqrt((power(sin(((rlat1 - rlat2) / 2)), 2) + ((cos(rlat1) * cos(rlat2)) * power(sin(((rlon1 - rlon2) / 2)), 2))))));
    assert(abs((gcarclen - pi)) >= 1e-12, "cannot compute intermediate points on a great circle whose endpoints are antipodal");

    [distance, azimuth] = vdist(lat1, lon1, lat2, lon2);
    incdist = (distance / (npts - 1));
    latpt = lat1;
    lonpt = lon1;
    lons = [lonpt];
    lats = [latpt];
    for(let _ of range(npts - 2)) {
        [latptnew, lonptnew] = vreckon(latpt, lonpt, incdist, azimuth);
        azimuth = vdist(latptnew, lonptnew, lat2, lon2, ell)[1];
        lats.append(latptnew);
        lons.append(lonptnew);
        latpt = latptnew;
        lonpt = lonptnew;
    }
    lons.append(lon2);
    lats.append(lat2);
    if (!deg) {
        lats = lats.map(radians);
        lons = lons.map(radians);
    }
    return [lats, lons];
}
