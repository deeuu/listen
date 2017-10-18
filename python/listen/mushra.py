import pandas as pd
import numpy as np
from scipy import stats
import collections
from . import utils
from . import correlation


WithinCorrelations = collections.namedtuple(
    'WithinCorrelations',
    'correlation spearman spearman_ci pearson pearson_ci concordance concordance_ci')


def get_descriptives(data):

    Descriptives = collections.namedtuple(
        'Descriptives',
        'median iqr mean std max min'
    )

    return Descriptives(median=data.median(),
                        iqr=data.quantile(0.75) - data.quantile(0.25),
                        mean=data.mean(),
                        std=data.std(),
                        max=data.max(),
                        min=data.min())


def average_replicates(frame):

    return frame.groupby(
        ['subject', 'experiment', 'page', 'sound']
    ).mean().reset_index()


def average(frame, mean_or_median='median'):

    frame = average_replicates(frame)

    if mean_or_median == 'mean':
        stat = np.mean
    else:
        stat = np.median

    frame = frame.groupby(['experiment', 'page', 'sound']).agg(stat)

    return  frame.reset_index()

def duration_stats(frame):

    frame = average_replicates(frame)

    medians = frame.groupby(
        ['experiment', 'subject'])['page_duration'].median()

    return medians, get_descriptives(medians.groupby('experiment'))


def normalise_ratings(frame, inplace=False):
    '''
    Performs min-max normlalisation to each subject's ratings -> [0, 100].

    Returns a dataframe.
    '''

    if not inplace:
        frame = frame.copy()

    frame['rating'] = frame.groupby(
        ['subject', 'experiment', 'page'])['rating'].transform(
            lambda g: 100 * (g - g.min()) / (g.max() - g.min())
        )

    return frame


def rank_ratings(frame, inplace=False):
    '''
    Returns a dataframe.
    '''

    if not inplace:
        frame = frame.copy()

    frame['rank'] = frame.groupby(
        ['subject', 'experiment', 'page'])['rating'].rank()

    return frame


def inter_rater_reliability(frame, col='rating', data_type='ratio', remove=None):

    if isinstance(remove, list):
        frame = frame[~frame.sound.isin(remove)]

    frame = average_replicates(frame)

    def _alpha(data):

        data = data.sort_values(by=['subject', 'sound'])
        num_subjects = len(pd.unique(data['subject']))
        data = data[col].as_matrix().reshape((num_subjects, -1))

        return correlation.krippendorffs_alpha(data, data_type)

    alpha = frame.groupby(['experiment', 'page']).agg(_alpha)

    return alpha, get_descriptives(alpha.groupby('experiment'))


def within_subject_agreement(frame, col='rating', mean_or_median='mean'):
    '''
    Computes Spearman, Pearson and Concordance correlations on replicated
    ratings.

    Returns a new Dataframe.
    '''

    if mean_or_median == 'mean':
        stat = np.mean
    else:
        stat = np.median

    def spearmanr(data):

        vals = []
        for g in data.groupby('page_order'):
            vals.append(g[1][col].values)

        return stats.spearmanr(vals[0], vals[1])[0]

    def pearsonr(data):

        vals = []
        for g in data.groupby('page_order'):
            vals.append(g[1][col].values)

        return stats.pearsonr(vals[0], vals[1])[0]

    def concordance(data):

        vals = []
        for g in data.groupby('page_order'):
            vals.append(g[1][col].values)

        return utils.concordance(vals[0], vals[1])

    reps = frame.query('is_replicate == True')
    spear = reps.groupby(['subject', 'experiment']).apply(spearmanr)
    spear.name = 'spearman'
    pear = reps.groupby(['subject', 'experiment']).apply(pearsonr)
    pear.name = 'pearson'
    concor = reps.groupby(['subject', 'experiment']).apply(concordance)
    concor.name = 'concordance'

    corrs = pd.concat([spear, pear, concor], axis=1)

    if mean_or_median == 'mean':
        estimate = corrs.groupby('experiment').agg(correlation.average)
    else:
        estimate = corrs.groupby('experiment').agg(stat)

    ci_spearman = corrs.groupby('experiment')['spearman'].apply(
        lambda g: correlation.confidence_interval(g, stat=stat)
    )

    ci_pearson = corrs.groupby('experiment')['pearson'].apply(
        lambda g: correlation.confidence_interval(g, stat=stat)
    )

    ci_concor = corrs.groupby('experiment')['concordance'].apply(
        lambda g: correlation.confidence_interval(g, stat=stat)
    )

    return WithinCorrelations(correlation=corrs,
                              spearman=estimate['spearman'],
                              spearman_ci=ci_spearman,
                              pearson=estimate['pearson'],
                              pearson_ci=ci_pearson,
                              concordance=estimate['concordance'],
                              concordance_ci=ci_concor)


def subject_vs_group(frame,
                     col='rating',
                     mean_or_median='median',
                     take_median_of_page_correlations=True):
    '''
    Computes Spearman and Pearson correlations between each subject's rating
    and the mean or median, for a given page.

    Returns a new Dataframe.
    '''

    def spearmanr(g, main_frame):

        main_frame = main_frame[main_frame.experiment.isin(g.experiment) &
                                main_frame.page.isin(g.page) & ~
                                main_frame.subject.isin(g.subject)
                                ]
        central_tend = main_frame.groupby(['experiment', 'page', 'sound']).agg(
            {col: stat}
        ).reset_index()

        return stats.spearmanr(g[col], central_tend[col])[0]

    def pearsonr(g, main_frame):

        main_frame = main_frame[main_frame.experiment.isin(g.experiment) &
                                main_frame.page.isin(g.page) & ~
                                main_frame.subject.isin(g.subject)
                                ]

        central_tend = main_frame.groupby(['experiment', 'page', 'sound']).agg(
            {col: stat}
        ).reset_index()

        return stats.pearsonr(g[col], central_tend[col])[0]

    # First average over any replicated pages
    frame = average_replicates(frame)

    if mean_or_median == 'median':
        stat = np.median
    else:
        stat = np.mean

    spear = frame.groupby(
        ['subject', 'experiment', 'page']).apply(
            lambda g: spearmanr(g, frame)
        )
    spear.name = 'spearman'

    pear = frame.groupby(
        ['subject', 'experiment', 'page']).apply(
            lambda g: pearsonr(g, frame)
        )
    pear.name = 'pearson'

    corrs = pd.concat([spear, pear], axis=1)

    median = corrs.groupby(['subject', 'experiment']).agg(np.median)

    ci_spearman = median.groupby('experiment')['spearman'].apply(
        lambda g: correlation.confidence_interval(g, stat=np.median)
    )

    ci_pearson = median.groupby('experiment')['pearson'].apply(
        lambda g: correlation.confidence_interval(g, stat=np.median)
    )

    return corrs, median
