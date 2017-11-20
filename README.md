# Listen

- Listen uses [Jekyll](https://jekyllrb.com/) to generate a (mobile-friendly)
  static website that can be served locally or online using
  [GitHub pages](https://pages.github.com/)

- The theme includes different interfaces for conducting listening tests, via
  the [Web-Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API).
  At present, interfaces are limited to a soundboard and a
  [MUSHRA](https://en.wikipedia.org/wiki/MUSHRA)-inspired slider interface

- For online tests, [Staticman](https://github.com/eduardoboucas/staticman) is
  used to process results (submitted by participants) as data files and
  uploaded to your GitHub repository

- Listen includes a Python package for parsing, compiling and analysing these
  data

## Installation

### Get Jekyll up and running

1. Install `rbenv` to manage Ruby. You may need dependencies for `rbenv`,
   compare
   [this tutorial](https://www.digitalocean.com/community/tutorials/how-to-install-ruby-on-rails-with-rbenv-on-ubuntu-16-04).
```
git clone https://github.com/rbenv/rbenv.git ~/.bashrc
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(rbenv init -)"' >> ~/.bashrc
source ~/.bashrc
```

2. Install `ruby-build`:
`git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build`

3. Install Ruby and set default:
```
rbenv install 2.4.1
rbenv global 2.4.1
```

3. Install the bundler gem:
`gem install bundler`

4. Install Jekyll:
`gem install jekyll`

### Building and serving

1. Install `Node.js`. For [example](https://gist.github.com/isaacs/579814)
```
echo 'export PATH=$HOME/local/bin:$PATH' >> ~/.bashrc
. ~/.bashrc
mkdir ~/local
mkdir ~/node-latest-install
cd ~/node-latest-install
curl http://nodejs.org/dist/node-latest.tar.gz | tar xz --strip-components=1
./configure --prefix=~/local
make install
curl https://www.npmjs.org/install.sh | sh
```

2. Install [npm](https://docs.npmjs.com/cli/install) dependencies under
   `node_modules`
```
git clone https://github.com/deeuu/listen
cd listen/site
npm install
```

3. Build and serve locally with `gulp`. This will generate the static site under
   the`_site` folder which will be served at `localhost:4000`.

## Design your site

## Similar software and how 'listen' differs

- [Web Audio Evaluation Tool](https://github.com/BrechtDeMan/WebAudioEvaluationTool)
- [webMUSHRA](https://github.com/audiolabs/webMUSHRA)
