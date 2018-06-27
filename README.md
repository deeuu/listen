# Listen

*This project is currently in a state of heavy development and is not yet
intended for deployment*

- Listen uses [Jekyll](https://jekyllrb.com/) to generate a (mobile-friendly)
static website that can be served locally or online using [GitHub pages](https://pages.github.com/)

- The theme includes different interfaces for conducting listening tests, via the [Web-Audio
API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API). At
present, interfaces are limited to a soundboard and a
[MUSHRA](https://en.wikipedia.org/wiki/MUSHRA)-inspired slider interface.
Expected additions include:

    - MUSHRA with vertical sliders
    - N-Alternative Forced Choice
    - Method-of-Adjustment
    - AB Test
    - Likert Scale

- For online tests, [Staticman](https://github.com/eduardoboucas/staticman) is
  used to process results (submitted by participants) as data files and
  uploaded to your GitHub repository

- Listen includes a Python package for parsing, compiling and analysing these data

## Examples

Listen has been used in the following projects:

- [Perceptual evaluation of source separation algorithms](https://cvssp.github.io/perceptual-study-source-separation/)
- [Perceptual Evaluation of Source Separation for Remixing Music](https://hagenw.github.io/2017/evaluation_of_source_separation_for_remixing/)

## Installation

### Get Jekyll up and running

1. Install `rbenv` to manage Ruby. You may need dependencies for `rbenv`, see
   [here](https://www.digitalocean.com/community/tutorials/how-to-install-ruby-on-rails-with-rbenv-on-ubuntu-16-04)
   ```
    git clone https://github.com/rbenv/rbenv.git ~/.rbenv
    echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
    echo 'eval "$(rbenv init -)"' >> ~/.bashrc
    source ~/.bashrc
    ```

2. Install `ruby-build`
    ```
    git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build
    ```

3. Install Ruby and set the default global version
    ```
    rbenv install 2.4.1
    rbenv global 2.4.1
    ```

4. Install the bundler gem
    ```
    gem install bundler
    ```

5. Install Jekyll
    ```
    gem install jekyll
    ```

### Install Node.js and npm

*Note: You can install the pre-built `Node.js` (with `npm` bundled) installer
[here](https://nodejs.org/en/download/)*

You can install `Node.js` and `npm` locally as follows (based on this
[example](https://gist.github.com/isaacs/579814)):

```
mkdir ~/local
echo 'export PATH=$HOME/local/bin:$PATH' >> ~/.bashrc
. ~/.bashrc

git clone https://github.com/nodejs/node
cd node
git checkout v9.8.0
./configure --prefix=~/local
make install
cd ../

git clone https://github.com/npm/npm
cd npm
make install 
```

## Setup your site for GitHub pages

*The following assumes that your static site will live on the `gh-pages` branch
of your website*

1. Clone this repository
    ```
    git clone https://github.com/deeuu/listen
    ```

2. [Change the remote URL](https://help.github.com/articles/changing-a-remote-s-url/), e.g.
    ```
    git remote set-url https://github.com/USERNAME/REPOSITORY.git
    ```

3. Edit the following files:
    - `./site/_config.yml`: set the `title` of your site.
    - `./site/_config.yml`: replace the `url` item, i.e. `https://USERNAME.github.io/REPOSITORY`

4. Add [Staticman](https://staticman.net/docs/) to your repository:
    - Go to your GitHub repository and hit the **Settings** page
    - Go to the **Collaborators** tab and add the username `staticmanapp`
    - Accept the invitation at
        ```
        https://api.staticman.net/v2/connect/{your GitHub username}/{your repository name}
        ```
5. Update the homepage `./site/index.md`, e.g.
    ```
    ---
    layout: page
    title: Welcome
    next_url: /mynewpage/
    ---
    # Welcome to Listen
    ```

6. Create a new page under a new subdirectory in the `./site/_pages` folder:
    ```
    mkdir ./site/_pages/mynewpage
    touch ./site/_pages/mynewpage/index.md
    ```

7. Add the following [frontmatter](https://jekyllrb.com/docs/frontmatter/) and
   text to `./site/_pages/mynewpage/index.md`:
    ```
    ---
    layout: page
    permalink: /mynewpage/
    title: Greetings
    ---

    Welcome to my new page!
    ```

7. Replace the contents of `./site/_data/menu.yml` (or delete this file if you
   don't want a navigation menu) with:

    ```
    - title: Welcome
      url: /
    - title: My new page
      url: /mynewpage/
    ```
8. Install the needed Gems from inside `./site`:
    ```
    bundle install
    ```

9. Install [npm](https://docs.npmjs.com/cli/install) dependencies under
   `node_modules` (you make run into installation/build errors if python 2.7.x is
   not in your PATH (e.g. switch the local environment if using pyenv)):
    ```
    cd ./site
    npm install
    ```

10. Still inside the `./site` directory, build your site and push it to
   `gh-pages`:
    ```
    npx gulp deploy
    ```

11. Visit `https://USERNAME.github.io/REPOSITORY`

## Building locally

1. Build and serve locally with `npx gulp` (inside `./site`). This will
   generate the static site inside `./site/_site` which will be served at
   `localhost:4000`.

## Similar software

- [Web Audio Evaluation Tool](https://github.com/BrechtDeMan/WebAudioEvaluationTool)
- [webMUSHRA](https://github.com/audiolabs/webMUSHRA)
