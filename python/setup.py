from setuptools import setup

setup(
    name='listen',
    version='0.0',
    description='Tools for analysing data from the listen framework.',
    author='Dominic Ward',
    author_email='contactdominicward+github@gmail.com',
    url='https://github.com/deeuu/listen',
    packages=['listen'],
    license='MIT',
    install_requires=[
        'numpy >= 1.12.1',
        'pandas >= 0.19.2',
        'matplotlib >= 2.0.0',
        'seaborn >= 0.7.1',
    ],
)
