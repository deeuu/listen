/*
 * AudioLoader
 */

var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContext();

function AudioLoader(urlList, callback) {

    this.urlList = urlList;
    this.onload = callback;
    this.buffers = new Array(urlList.length);

    this.gainNodes = [audioContext.createGain(), audioContext.createGain()]
    this.gainNodeIndex = 0;

    for (var i = 0; i < 2; ++i)
    {
        this.gainNodes[i].connect(audioContext.destination);
        this.gainNodes[i].gain.value = 0.0;
    }

    this.startedPlayingAtTime = null;
    this.fadeTime = 0.1;
    this.currentIndex = 0;
    this.continuousPlayback = true;
    this.loopPlayback = false;
    this.hasPlayed = []

}

AudioLoader.prototype.loadBuffer = function (url, index) {

    // Load buffer asynchronously
    var request = new XMLHttpRequest();
    request.responseType = "arraybuffer";
    request.open("GET", url, true);

    var loader = this;

    request.onload = function() {

        // Asynchronously decode the audio file data in request.response
        audioContext.decodeAudioData(request.response,
            function(buffer) {

                if (!buffer) {
                    alert('error decoding file data: ' + url);
                    return;
                }

                loader.buffers[index] = buffer;
            },

            function(error) {
                console.error('decodeAudioData error', error);
            }

        );
    }

    request.send();

    this.hasPlayed.push(false);
}

AudioLoader.prototype.load = function() {

    for (var i = 0; i < this.urlList.length; ++i)
        this.loadBuffer(this.urlList[i], i);

}

AudioLoader.prototype.play = function (index=0, loop=false) {

    this.stop();

    // get an AudioBufferSourceNode for playing our buffer
    this.source = audioContext.createBufferSource();

    // buffer config
    var buf = this.buffers[index];
    this.source.buffer = buf;
    this.source.loop = this.loopPlayback;
    this.source.loopStart = false;

    // ramping
    var currentGainNode = this.gainNodes[this.gainNodeIndex];
    this.source.connect(currentGainNode);

    // Playhead calculation (but not sample accurate)
    var onsetTime = 0;
    if (this.continuousPlayback)
    {
        if (this.currentIndex == index)
            this.startedPlayingAtTime = null;

        this.currentIndex = index;

        if (this.startedPlayingAtTime == null)
        {
            this.startedPlayingAtTime = audioContext.currentTime;
        }
        else
        {
            onsetTime  = audioContext.currentTime - this.startedPlayingAtTime;

            if (onsetTime > buf.duration)
            {
                this.startedPlayingAtTime = audioContext.currentTime;
                onsetTime = 0
            }
        }
    }

    this.source.start(0, onsetTime);
    this.hasPlayed[index] = true;

    currentGainNode.gain.linearRampToValueAtTime(
        1.0, audioContext.currentTime + this.fadeTime);

}

AudioLoader.prototype.stop = function() {

    if (this.source)
    {
        var whenToStop = audioContext.currentTime + this.fadeTime;

        var currentGainNode = this.gainNodes[this.gainNodeIndex];
        currentGainNode.gain.linearRampToValueAtTime(0.0,
                                                     whenToStop);

        this.source.stop(whenToStop);

        this.gainNodeIndex = (this.gainNodeIndex + 1) % 2;
    }
}

AudioLoader.prototype.resetContinuousPlay = function() {
    this.startedPlayingAtTime = null;
}

AudioLoader.prototype.haveAllBuffersPlayed = function () {
    return this.hasPlayed.every(function (bool) {return bool})
}
