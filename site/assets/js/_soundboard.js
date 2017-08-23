function Soundboard(config) {

    // Grab audio urls relative to site url
    urls = [];
    ids = [];
    for (var i = 0; i < config.sets.length; ++i)
    {
        for (var j = 0; j < config.sets[i].sounds.length; ++j)
        {
            var thisSound = config.sets[i].sounds[j];
            urls.push(config.siteURL + '/' + thisSound.url);
            ids.push(thisSound.id);
        }
    }

    // Configure the audio loader
    this.loader = new AudioLoader(urls, null);
    this.loader.continuousPlayback = config.continuous_playback;
    this.loader.loopPlayback = config.loop_playback;
    this.loader.load();

    // Map buttons to audio
    for (var i = 0; i < ids.length; ++i)
    {
        var btn = document.getElementById('btn-' + ids[i]);

        (function (i, loader) {
            btn.addEventListener("click", function() {
                loader.play(i);
            });
        })(i, this.loader);
    }

    // Stop audio
    var btn = document.getElementById('soundboard-stop');
    btn.addEventListener("click", this.loader.stop.bind(this.loader));
}
