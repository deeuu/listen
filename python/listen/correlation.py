import krippendorff
import pandas as pd
import numpy as np
from . import utils


def r_to_z(r):
    return np.arctanh(r)


def z_to_r(z):
    return np.tanh(z)


def confidence_interval(r, conf_level=95, stat=np.mean):

    z = r_to_z(r)
    ci = utils.bootstrap_ci(z, stat=stat, conf_level=conf_level)
    ci = z_to_r(ci)
    return pd.Series({'lo': ci[0], 'hi': ci[1]})


def average(r):

    return z_to_r(np.mean(r_to_z(r)))


def krippendorffs_alpha(data, level_of_measurement='ratio'):

    return krippendorff.alpha(reliability_data=data,
                              level_of_measurement=level_of_measurement)
