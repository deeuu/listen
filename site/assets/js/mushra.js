function Mushra(config) {

    this.config = config;
    this.pageCounter = 0;
    this.numberOfPages = this.config.pages.length;

    this.have_seen_this_page_before = arrayFilledWith(false, this.numberOfPages);

    this.pageOrder = fromAToBArray(0, this.numberOfPages);
    if (this.config.randomise_pages)
        shuffle(this.pageOrder);

    this.configureNextAndBackButton();
    this.loadPage();
}

Mushra.prototype.onNextOrBackButtonClick = function(direction)
{
    // If we are on the submission page, only allow previous test
    if (this.pageCounter == this.numberOfPages)
    {
        if(direction < 0)
        {
            this.pageCounter += direction;
            this.loadPage();
        }
    }
    // If final test page, allow complete
    else if (this.pageCounter == (this.numberOfPages - 1) && direction > 0)
    {
        this.fillConfig();
        this.pageCounter += direction;
        this.complete();
    }
    // Otherwise allow back or forward
    else
    {
        this.fillConfig();
        this.pageCounter += direction;
        if (this.pageCounter < 0)
            this.pageCounter = 0;
        else
            this.loadPage();
    }
}

Mushra.prototype.configureNextAndBackButton = function()
{
    $activePage ('.next-test').on("click", function(){

        if (this.loader.haveAllBuffersPlayed() ||
            !this.config.must_play_all_samples_to_continue)
        {
            this.onNextOrBackButtonClick(1);
        }
        else
        {
            $activePage (".listen-to-all-samples-popup").popup("open");
            setTimeout(function(){
                $activePage (".listen-to-all-samples-popup").popup("close");
            }, 5000);
        }

    }.bind(this));

    $activePage ('.previous-test').on("click", function(){
        this.onNextOrBackButtonClick(-1);
    }.bind(this));
}

Mushra.prototype.loadPage = function()
{
    this.updatePageCounter();

    // Remove sliders and stop current audio (if any)
    if (this.loader)
        this.loader.stop();

    // audio URLs and associated IDs
    this.currentPage = this.pageOrder[this.pageCounter];

    var order = fromAToBArray(0, this.config.pages[this.currentPage].sounds.length);

    if (this.config.randomise_order)
        shuffle(order);

    this.urls = new Array(order.length);
    this.ids = new Array(order.length);

    for (var j = 0; j < order.length; ++j)
    {
        var thisSound = this.config.pages[this.currentPage].sounds[order[j]];
        this.urls[j] = this.config.siteURL + '/' + thisSound.url;
        this.ids[j] = this.config.id + thisSound.id;
    }

    // Add the url to the reference audio. No need to store id here.
    var referenceIdx = this.urls.length;
    this.urls.push(
        this.config.siteURL + '/' + this.config.pages[this.currentPage].reference_url);

    // Configure the audio loader
    this.loader = new AudioLoader(this.urls, null);
    this.loader.continuousPlayback = this.config.continuous_playback;
    this.loader.loopPlayback = this.config.loop_playback;
    this.loader.load();

    // Stop audio
    $activePage ('.mushra-stop').on("click", this.loader.stop.bind(this.loader));

    // Reference
    $activePage ('.mushra-reference').on("click", function(i){
        this.loader.play(i);
    }.bind(this, referenceIdx));

    this.createSliders();

    if (!this.have_seen_this_page_before[this.pageCounter])
        this.have_seen_this_page_before[this.pageCounter] = true;
}

Mushra.prototype.createSliders = function()
{
    $activePage ('.mushra-slider-container').empty();

    var randomiseSliders = (this.config.randomise_slider_handle &&
                            !this.have_seen_this_page_before[this.pageCounter]);

    for (var i = 0; i < this.ids.length; ++i)
    {
        var startVal = 0;
        if (randomiseSliders)
            startVal = randomNumber(0, 100, true);
        else
            startVal = this.config.pages[this.pageCounter].sounds[i].rating;

        // The slider, triggers audio when user makes adjustment.
        var inputHTML = "<input type='range' name='slider' " +
        "value='" + startVal + "' min='0' max='100'";

        if (this.config.include_number_box)
            inputHTML += "class='mushra-slider'/>";
        else
            inputHTML += "class='ui-hidden-accessible mushra-slider'/>";

        $activePage ('.mushra-slider-container').append(inputHTML);
    }

    $activePage ('.mushra-slider-container').enhanceWithin();

    // Play audio when slider is moved
    var playFunc = function (i) {
            this.loader.play(i)
    }.bind(this);

    $activePage (".mushra-slider").each(function (i) {

        $(this).bind('slidestart', function (i) {
            // play this audio file
            playFunc (i);
            // change the theme when slider is moved
            $(this).attr('data-theme', 'b');
        }.bind(this, i));
    });
}

Mushra.prototype.fillConfig = function()
{
    var setRating = function(i, value)
    {
        this.config.pages[this.pageCounter].sounds[i].rating = value;
    }.bind(this);

    $activePage (".mushra-slider").each(
    function (i) {
        setRating (i, $(this).val());
    });
}

Mushra.prototype.complete = function()
{
    //$.mobile.pageContainer.pagecontainer("change", "#submit");
    $activePage ('.submit-popup').popup('open');

    /*
    $activePage ('submit-popup').on('click', function(form){

        for (var i = 0; i < this.numberOfPages; ++i)
        {
            values = '';
            for (var j = 0; j < this.config.pages[i].sounds.length; ++j)
                values += this.config.pages[i].sounds[j].rating + ',';

            var pageInput = document.createElement("input");
            pageInput.name = this.config.pages[i].name;
            pageInput.value = values;

            form.appendChild(pageInput);
        }
    }.bind(this, $('mushra-form')));
    */
}

Mushra.prototype.updatePageCounter = function()
{
   $activePage ('.title').html((this.pageCounter + 1) + ' / ' + this.numberOfPages);
}
