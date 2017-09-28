import pandas as pd
import numpy as np
from scipy import stats
import collections
from . import utils
from . import correlation


MushraCorrelations = collections.namedtuple(
    'MushraCorrelations', 'correlation median spearman_ci pearson_ci')


def within_subject_agreement(frame):
    '''
    Computes Spearman and Pearson correlations on replicated ratings.
    Returns a new Dataframe.
    '''

    def spearmanr(data):

        vals = []
        for g in data.groupby('page_order'):
            vals.append(g[1]['rating'].values)

        return stats.spearmanr(vals[0], vals[1])[0]

    def pearsonr(data):

        vals = []
        for g in data.groupby('page_order'):
            vals.append(g[1]['rating'].values)

        return stats.pearsonr(vals[0], vals[1])[0]

    reps = frame.query('is_replicate == True')
    spear = reps.groupby(['subject', 'experiment']).apply(spearmanr)
    spear.name = 'Spearman'
    pear = reps.groupby(['subject', 'experiment']).apply(pearsonr)
    pear.name = 'Pearson'

    corrs = pd.concat([spear, pear], axis=1)

    medians = corrs.groupby('experiment').agg(np.median)

    ci_spearman = corrs.groupby('experiment')['Spearman'].apply(
        lambda g: correlation.confidence_interval(g, stat=np.median)
    )

    ci_pearson = corrs.groupby('experiment')['Pearson'].apply(
        lambda g: correlation.confidence_interval(g, stat=np.median)
    )

    return MushraCorrelations(correlation=corrs,
                              median=medians,
                              spearman_ci=ci_spearman,
                              pearson_ci=ci_pearson)


def between_subject_agreement(frame,
                              mean_or_median='median',
                              take_median_of_page_correlations=True):
    '''
    Computes Spearman and Pearson correlations between each subject's rating
    and the mean or median, for a given page.

    Returns a new Dataframe.
    '''

    def spearmanr(g, central_tend):

        g2 = central_tend[(central_tend.experiment.isin(g.experiment)) &
                          (central_tend.page.isin(g.page))]

        return stats.spearmanr(g['rating'], g2['rating'])[0]

    def pearsonr(g, central_tend):

        g2 = central_tend[(central_tend.experiment.isin(g.experiment)) &
                          (central_tend.page.isin(g.page))]

        return stats.pearsonr(g['rating'], g2['rating'])[0]

    # First average over any replicated pages
    frame = frame.groupby(
        ['subject', 'experiment', 'page', 'sound']
    ).mean().reset_index()

    if mean_or_median == 'median':
        stat = np.median
    else:
        stat = np.mean

    central_tend = frame.groupby(['experiment', 'page', 'sound']).agg(
        {'rating': stat}
    ).reset_index()

    spear = frame.groupby(
        ['subject', 'experiment', 'page']).apply(
            lambda g: spearmanr(g, central_tend)
        )
    spear.name = 'Spearman'

    pear = frame.groupby(
        ['subject', 'experiment', 'page']).apply(
            lambda g: pearsonr(g, central_tend)
        )
    pear.name = 'Pearson'

    corrs = pd.concat([spear, pear], axis=1)

    median = corrs.groupby(['subject', 'experiment']).agg(np.median)

    ci_spearman = median.groupby('experiment')['Spearman'].apply(
        lambda g: correlation.confidence_interval(g, stat=np.median)
    )

    ci_pearson = median.groupby('experiment')['Pearson'].apply(
        lambda g: correlation.confidence_interval(g, stat=np.median)
    )

    return MushraCorrelations(correlation=corrs,
                              median=median,
                              spearman_ci=ci_spearman,
                              pearson_ci=ci_pearson)


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
