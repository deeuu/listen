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


def concordance(x, y):
    '''
    Computes the concordance correlation coefficient of two vectors x and y.
    '''
    x, y = x.flatten(), y.flatten()

    x_mean = np.mean(x)
    y_mean = np.mean(y)

    cov = np.cov(x, y, bias=True)
    x_var = cov[0, 0]
    y_var = cov[1, 1]
    cov = cov[0, 1]

    return 2 * cov / (x_var + y_var + (x_mean - y_mean) ** 2)
