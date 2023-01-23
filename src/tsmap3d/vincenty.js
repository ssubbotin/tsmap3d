/*
Vincenty's methods for computing ground distance and reckoning
*/

import {wgs84} from "./ellipsoid";
import {abs, asin, cos, pi, radians, sin, sqrt} from "./mathfun";
import {assert} from "./funcutils";

export {vdist, vreckon, track2};

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
    gcarclen = (2.0 * asin(sqrt((Math.pow(sin(((rlat1 - rlat2) / 2)), 2) + ((cos(rlat1) * cos(rlat2)) * Math.pow(sin(((rlon1 - rlon2) / 2)), 2))))));
    if ((abs((gcarclen - pi)) < 1e-12)) {
        throw new Error("cannot compute intermediate points on a great circle whose endpoints are antipodal");
    }
    [distance, azimuth] = vdist(lat1, lon1, lat2, lon2);
    incdist = (distance / (npts - 1));
    latpt = lat1;
    lonpt = lon1;
    lons = [lonpt];
    lats = [latpt];
    for (let _ = 0, _pj_a = (npts - 2); (_ < _pj_a); _ += 1) {
        [latptnew, lonptnew] = vreckon(latpt, lonpt, incdist, azimuth);
        azimuth = vdist(latptnew, lonptnew, lat2, lon2, {"ell": ell})[1];
        lats.append(latptnew);
        lons.append(lonptnew);
        latpt = latptnew;
        lonpt = lonptnew;
    }
    lons.append(lon2);
    lats.append(lat2);
    if ((! deg)) {
        lats = list(map(radians, lats));
        lons = list(map(radians, lons));
    }
    return [lats, lons];
}
