/*
Utility functions

all assume radians
*/

import {wgs84} from './ellipsoid';
import {atan2, cos, hypot, pi, radians, sin} from './mathfun';

export {cart2pol, pol2cart, cart2sph, sph2cart, assert};

function cart2pol(x, y) {
    /* Transform Cartesian to polar coordinates */
    return [atan2(y, x), hypot(x, y)];
}

function pol2cart(theta, rho) {
    /* Transform polar to Cartesian coordinates */
    return [(rho * cos(theta)), (rho * sin(theta))];
}

function cart2sph(x, y, z) {
    /* Transform Cartesian to spherical coordinates */
    let az, el, hxy, r;
    hxy = hypot(x, y);
    r = hypot(hxy, z);
    el = atan2(z, hxy);
    az = atan2(y, x);
    return [az, el, r];
}

function sph2cart(az, el, r) {
    /* Transform spherical to Cartesian coordinates */
    let rcos_theta, x, y, z;
    rcos_theta = (r * cos(el));
    x = (rcos_theta * cos(az));
    y = (rcos_theta * sin(az));
    z = (r * sin(el));
    return [x, y, z];
}

function sanitize(lat, ell, deg) {
    if ((ell === null)) {
        ell = wgs84;
    }
    if (deg) {
        lat = radians(lat);
    }
    if ((abs(lat) > (pi / 2))) {
        throw new Error("-pi/2 <= latitude <= pi/2");
    }
    return [lat, ell];
}

function assert(condition, exception) {
    if(!condition) {
        throw new Error(exception)
    }
}
