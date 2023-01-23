/* Minimal class for planetary ellipsoids */

import {power, sqrt} from "./mathfun";
import {assert} from "./funcutils";

class Ellipsoid {
    /*
    generate reference ellipsoid parameters

    as everywhere else in pymap3d, distance units are METERS

    Ellipsoid sources
    -----------------

    maupertuis, plessis, everest1830, everest1830m, everest1967,
    airy, bessel, clarke1866, clarke1878, clarke1860, helmert, hayford,
    international1924, krassovsky1940, wgs66, australian, international1967,
    grs67, sa1969, wgs72, iers1989, iers2003:

    - https://en.wikipedia.org/wiki/Earth_ellipsoid#Historical_Earth_ellipsoids
    - https://en.wikibooks.org/wiki/PROJ.4#Spheroid

    wgs84: https://en.wikipedia.org/wiki/World_Geodetic_System#WGS84

    wgs84_mean: https://en.wikipedia.org/wiki/Earth_radius#Mean_radii

    grs80: https://en.wikipedia.org/wiki/GRS_80

    io: https://doi.org/10.1006/icar.1998.5987

    pz90.11: https://structure.mil.ru/files/pz-90.pdf

    gsk2011: https://racurs.ru/downloads/documentation/gost_r_32453-2017.pdf

    mars: https://tharsis.gsfc.nasa.gov/geodesy.html

    mercury, venus, moon, jupiter, saturn, uranus, neptune:

    - https://nssdc.gsfc.nasa.gov/planetary/factsheet/index.html

    feel free to suggest additional ellipsoids
    */
    constructor(semimajor_axis, semiminor_axis, name = "") {
        /*
        Ellipsoidal model of world

        Parameters
        ----------
        semimajor_axis : float
        semimajor axis in meters
        semiminor_axis : float
        semiminor axis in meters
        name: str, optional
        Human-friendly name for the ellipsoid
        */
        this.flattening = ((semimajor_axis - semiminor_axis) / semimajor_axis);
        assert((this.flattening >= 0), "flattening must be >= 0");
        this.thirdflattening = ((semimajor_axis - semiminor_axis) / (semimajor_axis + semiminor_axis));
        this.eccentricity = sqrt(((2 * this.flattening) - power(this.flattening, 2)));
        this.name = name;
        this.semimajor_axis = semimajor_axis;
        this.semiminor_axis = semiminor_axis;
    }
}

// Earth ellipsoids
export const maupertuis = new Ellipsoid(6397300.0, 6363806.283, "Maupertuis (1738)");
export const plessis = new Ellipsoid(6376523.0, 6355862.9333, "Plessis (1817)");
export const everest1830 = new Ellipsoid(6377299.365, 6356098.359, "Everest (1830)");
export const everest1830m = new Ellipsoid(6377304.063, 6356103.039, "Everest 1830 Modified (1967)");
export const everest1967 = new Ellipsoid(6377298.556, 6356097.55, "Everest 1830 (1967 Definition)");
export const airy = new Ellipsoid(6377563.396, 6356256.909, "Airy (1830)");
export const bessel = new Ellipsoid(6377397.155, 6356078.963, "Bessel (1841)");
export const clarke1866 = new Ellipsoid(6378206.4, 6356583.8, "Clarke (1866)");
export const clarke1878 = new Ellipsoid(6378190.0, 6356456.0, "Clarke (1878)");
export const clarke1860 = new Ellipsoid(6378249.145, 6356514.87, "Clarke (1880)");
export const helmert = new Ellipsoid(6378200.0, 6356818.17, "Helmert (1906)");
export const hayford = new Ellipsoid(6378388.0, 6356911.946, "Hayford (1910)");
export const international1924 = new Ellipsoid(6378388.0, 6356911.946, "International (1924)");
export const krassovsky1940 = new Ellipsoid(6378245.0, 6356863.019, "Krassovsky (1940)");
export const wgs66 = new Ellipsoid(6378145.0, 6356759.769, "WGS66 (1966)");
export const australian = new Ellipsoid(6378160.0, 6356774.719, "Australian National (1966)");
export const international1967 = new Ellipsoid(6378157.5, 6356772.2, "New International (1967)");
export const grs67 = new Ellipsoid(6378160.0, 6356774.516, "GRS-67 (1967)");
export const sa1969 = new Ellipsoid(6378160.0, 6356774.719, "South American (1969)");
export const wgs72 = new Ellipsoid(6378135.0, 6356750.52001609, "WGS-72 (1972)");
export const grs80 = new Ellipsoid(6378137.0, 6356752.31414036, "GRS-80 (1979)");
export const wgs84 = new Ellipsoid(6378137.0, 6356752.31424518, "WGS-84 (1984)");
export const wgs84_mean = new Ellipsoid(6371008.7714, 6371008.7714, "WGS-84 (1984) Mean");
export const iers1989 = new Ellipsoid(6378136.0, 6356751.302, "IERS (1989)");
export const pz90_11 = new Ellipsoid(6378136.0, 6356751.3618, "ПЗ-90 (2011)");
export const iers2003 = new Ellipsoid(6378136.6, 6356751.9, "IERS (2003)");
export const gsk2011 = new Ellipsoid(6378136.5, 6356751.758, "ГСК (2011)");

// Other worlds
export const mercury = new Ellipsoid(2440500.0, 2438300.0, "Mercury");
export const venus = new Ellipsoid(6051800.0, 6051800.0, "Venus");
export const moon = new Ellipsoid(1738100.0, 1736000.0, "Moon");
export const mars = new Ellipsoid(3396900.0, 3376097.80585952, "Mars");
export const jupyter = new Ellipsoid(71492000.0, 66770054.3475922, "Jupiter");
export const io = new Ellipsoid(1829.7, 1815.8, "Io");
export const saturn = new Ellipsoid(60268000.0, 54364301.5271271, "Saturn");
export const uranus = new Ellipsoid(25559000.0, 24973000.0, "Uranus");
export const neptune = new Ellipsoid(24764000.0, 24341000.0, "Neptune");
export const pluto = new Ellipsoid(1188000.0, 1188000.0, "Pluto");
