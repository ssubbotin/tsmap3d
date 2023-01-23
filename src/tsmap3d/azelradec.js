/* Azimuth / elevation <==> Right ascension, declination */

import {azel2radec as vazel2radec} from './vallado';
import {radec2azel as vradec2azel} from './vallado';

export {radec2azel, azel2radec};

function azel2radec(az_deg, el_deg, lat_deg, lon_deg, time) {
    /*
    viewing angle (az, el) to sky coordinates (ra, dec)

    Parameters
    ----------
    az_deg : float
    azimuth [degrees clockwize from North]
    el_deg : float
    elevation [degrees above horizon (neglecting aberration)]
    lat_deg : float
    observer latitude [-90, 90]
    lon_deg : float
    observer longitude [-180, 180] (degrees)
    time : datetime.datetime or str
    time of observation

    Returns
    -------
    ra_deg : float
    ecliptic right ascension (degress)
    dec_deg : float
    ecliptic declination (degrees)
    */
    return vazel2radec(az_deg, el_deg, lat_deg, lon_deg, time);
}

function radec2azel(ra_deg, dec_deg, lat_deg, lon_deg, time) {
    /*
    sky coordinates (ra, dec) to viewing angle (az, el)

    Parameters
    ----------
    ra_deg : float
    ecliptic right ascension (degress)
    dec_deg : float
    ecliptic declination (degrees)
    lat_deg : float
    observer latitude [-90, 90]
    lon_deg : float
    observer longitude [-180, 180] (degrees)
    time : datetime.datetime or str
    time of observation

    Returns
    -------
    az_deg : float
    azimuth [degrees clockwize from North]
    el_deg : float
    elevation [degrees above horizon (neglecting aberration)]
    */
    return vradec2azel(ra_deg, dec_deg, lat_deg, lon_deg, time);
}
