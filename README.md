# Listen

- Listen uses [Jekyll](https://jekyllrb.com/) to generate a (mobile-friendly)
static website that can be served locally or online using [GitHub pages](https://pages.github.com/)

- The theme includes different interfaces for conducting listening tests, via the [Web-Audio
API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API). At
present, interfaces are limited to a soundboard and a [MUSHRA](https://en.wikipedia.org/wiki/MUSHRA)-inspired slider interface

- For online tests, [Staticman](https://github.com/eduardoboucas/staticman) is used to process results (submitted by participants) as data files and uploaded to your GitHub repository

- Listen includes a Python package for parsing, compiling and analysing these data

## Installation

### Get Jekyll up and running

1. Install `rbenv` to manage Ruby. You may need dependencies for `rbenv`, see [here](https://www.digitalocean.com/community/tutorials/how-to-install-ruby-on-rails-with-rbenv-on-ubuntu-16-04)
```
git clone https://github.com/rbenv/rbenv.git ~/.bashrc
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(rbenv init -)"' >> ~/.bashrc
source ~/.bashrc
```

2. Install `ruby-build`
```
git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build
```

3. Install Ruby and set default
```
rbenv install 2.4.1
rbenv global 2.4.1
```

3. Install the bundler gem
```
gem install bundler
```

4. Install Jekyll
```gem install jekyll
```

### Install Node.js and npm

Note: You can install the pre-built `Node.js` (with `npm` bundled) installer
[here](https://nodejs.org/en/download/).

You can install `Node.js` directly from GitHub. For
[example](https://gist.github.com/isaacs/579814)
```
mkdir ~/local
echo 'export PATH=$HOME/local/bin:$PATH' >> ~/.bashrc
. ~/.bashrc
git clone https://github.com/nodejs/node
cd node
./configure --prefix=~/local
make install
```

## Setup your site for GitHub pages

1. [Create a new GitHub repository](https://github.com/new)

2. Clone the `gh-pages` branch of this repository
```
git clone -b gh-pages https://github.com/deeuu/listen
```

3. [Change the remote URL](https://help.github.com/articles/changing-a-remote-s-url/), e.g.
```
git remote set-url https://github.com/USERNAME/REPOSITORY.git
```

3. Edit the following files:
    - `_config.yml` (optional): set the `title` of your site.
    - `_config.yml`: replace the `url` and `github` repository items.
    - `staticman.yml`: replace the `branch` item if you are not using `gh-pages`

4. Add [Staticman](https://staticman.net/docs/) to your repository:
    - Go to your GitHub repository and hit the **Settings** page
    - Go to the **Collaborators** tab and add the username `staticmanapp`
    - Accept the invitation at
    ```
    https://api.staticman.net/v2/connect/{your GitHub username}/{your repository name}
    ```
5. Update the homepage `index.md`.

6. Create a new page under a new directory:
```
mkdir _pages/mynewpage && touch _pages/mynewpage/index.md
```
and add the following [frontmatter](https://jekyllrb.com/docs/frontmatter/) and text:
```
---
layout: page
permalink: /mynewpage/
title: Greetings!
---

Welcome to my new page!
```

7. Update the `menu.yml` (if you want a menu):
```
- title: Welcome
  url: /
- title: My new page
  url: /mynewpage/
- title: Interface layouts
  sublinks:
    - title: MUSHRA
      url: /mushra/
    - title: Similarity
      url: /similarity/
    - title: Soundboard
      url: /soundboard/
```

## Building locally

1. Install [npm](https://docs.npmjs.com/cli/install) dependencies under `node_modules`
```
npm install
```

2. Build and serve locally with `npx gulp`. This will generate the static site under
   the`_site` folder which will be served at `localhost:4000`.


## Similar software and how 'listen' differs

- [Web Audio Evaluation Tool](https://github.com/BrechtDeMan/WebAudioEvaluationTool)
- [webMUSHRA](https://github.com/audiolabs/webMUSHRA)
