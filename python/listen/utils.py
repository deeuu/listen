import matplotlib.pyplot as plt
import numpy as np


def bootstrap_ci(data, stat, n=1000, conf_level=95, plot=False):
    '''
    Bootstrap CI estimate for a statistic applied to the sample.
    '''

    lo_cut = (100 - conf_level) / 2
    hi_cut = 100 - lo_cut

    out = np.zeros((n, data.ndim))

    for i in range(n):

        sample = data.sample(len(data), replace=True)
        out[i] = stat(sample, axis=0)

    if plot:
        plt.hist(out)
        plt.show()

    return np.percentile(out, [lo_cut, hi_cut])
