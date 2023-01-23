/*
converts right ascension, declination to azimuth, elevation and vice versa.

Michael Hirsch implementation of algorithms from D. Vallado
*/
import {abs, asin, atan2, cos, degrees, radians, sin} from './mathfun';
import {datetime2sidereal} from './sidereal';

export {azel2radec, radec2azel};

function azel2radec(az_deg, el_deg, lat_deg, lon_deg, time) {
    /*
    converts azimuth, elevation to right ascension, declination

    Parameters
    ----------

    az_deg : float
    azimuth (clockwise) to point [degrees]
    el_deg : float
    elevation above horizon to point [degrees]
    lat_deg : float
    observer WGS84 latitude [degrees]
    lon_deg : float
    observer WGS84 longitude [degrees]
    time : datetime.datetime
    time of observation


    Results
    -------

    ra_deg : float
    right ascension to target [degrees]
    dec_deg : float
    declination of target [degrees]

    from D.Vallado Fundamentals of Astrodynamics and Applications
    p.258-259
    */
    let az, dec, el, lat, lha, lon, lst;
    if ((abs(lat_deg) > 90)) {
        throw new Error("-90 <= lat <= 90");
    }
    az = radians(az_deg);
    el = radians(el_deg);
    lat = radians(lat_deg);
    lon = radians(lon_deg);
    dec = asin(((sin(el) * sin(lat)) + ((cos(el) * cos(lat)) * cos(az))));
    lha = atan2(((-(sin(az) * cos(el))) / cos(dec)), ((sin(el) - (sin(lat) * sin(dec))) / (cos(dec) * cos(lat))));
    lst = datetime2sidereal(time, lon);
    /*  by definition right ascension [0, 360) degrees  */
    return [(degrees((lst - lha)) % 360), degrees(dec)];
}

function radec2azel(ra_deg, dec_deg, lat_deg, lon_deg, time) {
    /*
    converts right ascension, declination to azimuth, elevation

    Parameters
    ----------

    ra_deg : float
    right ascension to target [degrees]
    dec_deg : float
    declination to target [degrees]
    lat_deg : float
    observer WGS84 latitude [degrees]
    lon_deg : float
    observer WGS84 longitude [degrees]
    time : datetime.datetime
    time of observation

    Results
    -------

    az_deg : float
    azimuth clockwise from north to point [degrees]
    el_deg : float
    elevation above horizon to point [degrees]


    from D. Vallado "Fundamentals of Astrodynamics and Applications "
    4th Edition Ch. 4.4 pg. 266-268
    */
    let az, dec, el, lat, lha, lon, lst, ra;
    if ((abs(lat_deg) > 90)) {
        throw new Error("-90 <= lat <= 90");
    }
    ra = radians(ra_deg);
    dec = radians(dec_deg);
    lat = radians(lat_deg);
    lon = radians(lon_deg);
    lst = datetime2sidereal(time, lon);
    lha = (lst - ra);
    el = asin(((sin(lat) * sin(dec)) + ((cos(lat) * cos(dec)) * cos(lha))));
    az = atan2((((-sin(lha)) * cos(dec)) / cos(el)), ((sin(dec) - (sin(el) * sin(lat))) / (cos(el) * cos(lat))));
    return [(degrees(az) % 360.0), degrees(el)];
}
