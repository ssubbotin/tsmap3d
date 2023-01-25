/*  transforms involving ECI earth-centered inertial  */

import {assert} from "./funcutils";

export {eci2ecef, ecef2eci};

function eci2ecef(x, y, z, time) {
    /*
    Observer => Point  ECI  =>  ECEF

    J2000 frame

    Parameters
    ----------
    x : float
    ECI x-location [meters]
    y : float
    ECI y-location [meters]
    z : float
    ECI z-location [meters]
    time : datetime.datetime
    time of obsevation (UTC)

    Results
    -------
    x_ecef : float
    x ECEF coordinate
    y_ecef : float
    y ECEF coordinate
    z_ecef : float
    z ECEF coordinate
    */
    assert(false, "TBD: eci2ecef not implemented yet")
    let gcrs, itrs, x_ecef, y_ecef, z_ecef;
    gcrs = new GCRS(new CartesianRepresentation((x * u.m), (y * u.m), (z * u.m)), {"obstime": time});
    itrs = gcrs.transform_to(new ITRS({"obstime": time}));
    x_ecef = itrs.x.value;
    y_ecef = itrs.y.value;
    z_ecef = itrs.z.value;
    return [x_ecef, y_ecef, z_ecef];
}

function ecef2eci(x, y, z, time) {
    /*
    Point => Point   ECEF => ECI

    J2000 frame

    Parameters
    ----------

    x : float
    target x ECEF coordinate
    y : float
    target y ECEF coordinate
    z : float
    target z ECEF coordinate
    time : datetime.datetime
    time of observation

    Results
    -------
    x_eci : float
    x ECI coordinate
    y_eci : float
    y ECI coordinate
    z_eci : float
    z ECI coordinate
    */
    assert(false, "TBD: ecef2eci not implemented yet")
    let eci, gcrs, itrs, x_eci, y_eci, z_eci;
    itrs = new ITRS(new CartesianRepresentation((x * u.m), (y * u.m), (z * u.m)), {"obstime": time});
    gcrs = itrs.transform_to(new GCRS({"obstime": time}));
    eci = new EarthLocation(...gcrs.cartesian.xyz);
    x_eci = eci.x.value;
    y_eci = eci.y.value;
    z_eci = eci.z.value;
    return [x_eci, y_eci, z_eci];
}
