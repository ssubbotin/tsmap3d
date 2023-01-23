/*
PyMap3D provides coordinate transforms and geodesy functions with a similar API
to the Matlab Mapping Toolbox, but was of course independently derived.

For all functions, the default units are:

distance : float
METERS
angles : float
DEGREES
time : datetime.datetime
UTC time of observation

These functions may be used with any planetary body, provided the appropriate
reference ellipsoid is defined. The default ellipsoid is WGS-84

deg : bool = True means degrees. False = radians.

Most functions accept NumPy arrays of any shape, as well as compatible data types
including AstroPy, Pandas and Xarray that have Numpy-like data properties.
For clarity, we omit all these types in the docs, and just specify the scalar type.

Other languages
---------------

Companion packages exist for:

* Matlab / GNU Octave: [Matmap3D](https://github.com/geospace-code/matmap3d)
* Fortran: [Maptran3D](https://github.com/geospace-code/maptran3d)*/
import {aer2ecef, aer2geodetic, ecef2aer, geodetic2aer} from './aer';
import {
    ecef2enu,
    ecef2enuv,
    ecef2geodetic,
    eci2geodetic,
    enu2ecef,
    enu2uvw,
    geodetic2ecef,
    geodetic2eci,
    uvw2enu
} from './ecef';
import {aer2enu, enu2aer, enu2geodetic, geodetic2enu} from './enu';
import {aer2ned, ecef2ned, ecef2nedv, geodetic2ned, ned2aer, ned2ecef, ned2geodetic} from './ned';
import {datetime2sidereal, greenwichsrt} from './sidereal';
import {geodetic2spherical, spherical2geodetic} from './spherical';
import {str2dt} from './timeconv';
import {aer2eci, eci2aer} from './aer';
import {azel2radec, radec2azel} from './azelradec';
import {ecef2eci, eci2ecef} from './eci';

export {
    aer2eci,
    eci2aer,
    ecef2eci,
    eci2ecef,
    aer2ecef,
    aer2geodetic,
    ecef2aer,
    geodetic2aer,
    ecef2enu,
    ecef2enuv,
    ecef2geodetic,
    eci2geodetic,
    enu2ecef,
    enu2uvw,
    geodetic2ecef,
    geodetic2eci,
    uvw2enu,
    aer2enu,
    enu2aer,
    enu2geodetic,
    geodetic2enu,
    aer2ned,
    ecef2ned,
    ecef2nedv,
    geodetic2ned,
    ned2aer,
    ned2ecef,
    ned2geodetic,
    datetime2sidereal,
    greenwichsrt,
    geodetic2spherical,
    spherical2geodetic,
    str2dt,
    azel2radec,
    radec2azel
};
