import os
import pandas as pd
import json


class Parser():

    def __init__(self, path, excludes=None):
        self.path = path
        self.excludes = excludes

    def load(self, filename):
        '''
        Loads a json data file and parses the 'data' JSON string as a
        dictionary.
        '''

        with open(filename, 'r') as f:
            out = json.load(f)

        if 'name' not in out.keys():
            out['name'] = None

        out['data'] = json.loads(out['data'])

        return out

    def to_dataframe(self, filename):
        pass

    def parse(self):

        if os.path.isdir(self.path):

            frame = pd.DataFrame()
            for filename in os.listdir(self.path):
                if (filename.endswith('.json') and
                        filename not in self.excludes):
                    return frame.append(
                        self.to_dataframe(self.load(filename))
                    )
        else:
            return self.to_dataframe(self.load(self.path))


class MUSHRA(Parser):

    def to_dataframe(self, data):
        '''
        Returns the mushra rating data as a Pandas DataFrame
        '''
        frame = pd.DataFrame()
        frame['Subject'] = data['name']

        pages = data['data']['pages']
        for page in pages:

            name = []
            rating = []
            url = []
            for sound in page['sounds']:

                name.append(sound['name'])
                rating.append(sound['rating'])
                url.append(sound['url'])

            temp = pd.DataFrame({'Sound': name,
                                 'URL': url,
                                 'Rating': rating,
                                 'Page': page['name'],
                                 'PageOrder': page['order'],
                                 'PageDuration': page['duration'],
                                 })

            frame = frame.append(temp)

        return frame
