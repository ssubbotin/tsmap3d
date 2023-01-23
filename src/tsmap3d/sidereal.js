/*  manipulations of sidereal time  */
import {power, tau} from './mathfun';
import {str2dt} from './timeconv';

export {datetime2sidereal, juliandate, greenwichsrt};

function datetime2sidereal(time: Date, lon_radians: Number) {
    /*
    Convert ``datetime`` to local sidereal time

    from D. Vallado "Fundamentals of Astrodynamics and Applications"

    Parameters
    ----------
    time : datetime
    time to convert
    lon_radians : float
    longitude (radians)

    Results
    -------
    tsr : float
    Local sidereal time
    */
    let gst, jd, tsr;
    jd = juliandate(str2dt(time));
    gst = greenwichsrt(jd);
    tsr = (gst + lon_radians);
    return tsr;
}

function juliandate(time: Date) {
    /*
    Python datetime to Julian time (days since Jan 1, 4713 BCE)

    from D.Vallado Fundamentals of Astrodynamics and Applications p.187
    and J. Meeus Astronomical Algorithms 1991 Eqn. 7.1 pg. 61

    Parameters
    ----------
    time : datetime
    time to convert

    Results
    -------
    jd : float
    Julian date (days since Jan 1, 4713 BCE)
    */
    let A, B, C, month, year;
    if ((time.getMonth() < 3)) {
        year = (time.getFullYear() - 1);
        month = (time.getMonth() + 12);
    } else {
        year = time.getFullYear();
        month = time.getMonth();
    }
    A = Number.parseInt((year / 100.0));
    B = ((2 - A) + Number.parseInt((A / 4.0)));
    C = (((((time.getSeconds() / 60.0) + time.getMinutes()) / 60.0) + time.getHours()) / 24.0);
    return (((((Number.parseInt((365.25 * (year + 4716))) + Number.parseInt((30.6001 * (month + 1)))) + time.getDay()) + B) - 1524.5) + C);
}

function greenwichsrt(jdate) {
    /*
    Convert Julian time to sidereal time

    D. Vallado Ed. 4

    Parameters
    ----------
    jdate: float
    Julian date (since Jan 1, 4713 BCE)

    Results
    -------
    tsr : float
    Sidereal time
    */
    let gmst_sec, tUT1;
    tUT1 = ((jdate - 2451545.0) / 36525.0);
    gmst_sec = (((67310.54841 + (((876600 * 3600) + 8640184.812866) * tUT1)) + (0.093104 * power(tUT1, 2))) - (6.2e-06 * power(tUT1, 3)));
    return (((gmst_sec * tau) / 86400.0) % tau);
}
