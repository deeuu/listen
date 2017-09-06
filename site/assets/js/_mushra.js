function Mushra(config) {

    console.log('MUSHRA');

    this.config = config;

    this.pageCounter = 0;
    this.numberOfSounds = 0;
    this.numberOfPages = this.config.pages.length;
    this.have_seen_this_page_before = arrayFilledWith(false, this.numberOfPages);

    // Order of pages
    this.pageOrder = fromAToBArray(0, this.numberOfPages);
    if (this.config.randomise_pages)
        shuffle(this.pageOrder);

    // Order of sounds within page
    this.soundOrder = [];
    for (var i = 0; i < this.numberOfPages; ++i)
    {
        var numberOfSounds = this.config.pages[this.pageOrder[i]].sounds.length;
        var order = fromAToBArray(0, numberOfSounds);
        if (this.config.randomise_sounds_within_page)
            shuffle(order);
        this.soundOrder.push(order);
    }

    this.configureNextAndBackButton();

    this.updateTitle();
    this.loadPage();
}

Mushra.prototype.configureNextAndBackButton = function()
{
    $activePage ('.next').off().on("click", function (e){

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

    $activePage ('.back').off().on("click", function (e){

        this.onNextOrBackButtonClick(-1);

    }.bind(this));
}

Mushra.prototype.onNextOrBackButtonClick = function (direction)
{
    // Stop any audio
    if (this.loader)
        this.loader.stop();

    this.fillConfig();

    this.pageCounter = selectMinimum (this.pageCounter + direction,
                                      this.numberOfPages);

    this.pageCounter = selectMaximum (this.pageCounter, 0);

    // Complete or not
    if (this.pageCounter == this.numberOfPages)
    {
        if (this.config.allow_submission)
            this.complete();
        else
            $.mobile.changePage (this.config.nextURL);
    }
    else
    {
        this.updateTitle();
        this.loadPage();
    }
}

Mushra.prototype.updateTitle = function()
{
    $activePage ('.title').html ((this.pageCounter + 1) + ' / ' +
                                 this.numberOfPages);
}

Mushra.prototype.loadPage = function()
{

    this.currentPage = this.pageOrder[this.pageCounter];
    this.currentPageSoundOrder = this.soundOrder[this.pageCounter];
    var numberOfSounds = this.currentPageSoundOrder.length;

    this.urls = new Array(numberOfSounds);

    for (var i = 0; i < numberOfSounds; ++i)
    {
        var thisSound = this.config.pages[this.currentPage].sounds[this.currentPageSoundOrder[i]];
        this.urls[i] = this.config.siteURL + '/' + thisSound.url;
    }

    // Add the url to the reference audio. No need to store id here.
    this.urls.push(
        this.config.siteURL + '/' + this.config.pages[this.currentPage].reference_url);

    // Configure the audio loader
    this.loader = new AudioLoader(this.urls,
                                  this.config.continuous_playback,
                                  this.config.loop_playback);

    this.loader.load();

    // Stop audio
    $activePage ('.mushra-stop').off().on("click", function() {
        this.loader.stop();
        this.loader.resetContinuousPlay();
    }.bind(this));

    // Reference
    $activePage ('.mushra-reference').off().on("click", function(i){
        this.loader.play(i);
    }.bind(this, numberOfSounds));

    this.createSliders();

    if (!this.have_seen_this_page_before[this.pageCounter])
        this.have_seen_this_page_before[this.pageCounter] = true;
}

Mushra.prototype.createSliders = function()
{
    $activePage ('.mushra-slider-container').empty();

    var numberOfSounds = this.currentPageSoundOrder.length;
    for (var i = 0; i < numberOfSounds; ++i)
    {
        var startVal = 0;
        if (this.have_seen_this_page_before[this.pageCounter])
            startVal = this.config.pages[this.currentPage].sounds[this.currentPageSoundOrder[i]].rating;
        else if (this.config.randomise_slider_handle)
            startVal = randomNumber(0, 100, true);

        // The slider, triggers audio when user makes adjustment.
        var inputHTML = "<input type='range' name='slider' " +
        "value='" + startVal + "' min='0' max='100' class='ui-hidden-accessible'";

        if (this.config.include_number_box)
            inputHTML += "data-show-value='true'/>";
        else
            inputHTML += "/>";

        $activePage ('.mushra-slider-container').append(inputHTML);
    }

    $activePage ('.mushra-slider-container').trigger('create');
    $activePage ('.mushra-slider-container').enhanceWithin();

    // Play audio when slider is moved
    var playFunc = function (i) {
            this.loader.play(i)
    }.bind(this);

    $activePage (".ui-slider").each(function (i) {

        $(this).on('slidestart', function (i) {

            // play this audio file
            playFunc (i);
            // change handle colour when slider is moved
            $(this).find('a').addClass('slider-handle-active');
            // Give focus to the handle even if handle is clicked
            $(this).find('a').focus();

        }.bind(this, i));
    });
}

Mushra.prototype.fillConfig = function()
{
    var setRating = function(i, value) {
        this.config.pages[this.currentPage].sounds[this.currentPageSoundOrder[i]].rating = value;
    }.bind(this);

    $activePage (".ui-slider input").each( function (i) {
        setRating (i, $(this).val());
    });
}

Mushra.prototype.complete = function()
{
    // Build an array of arrays for the ratings
    var values = '[';
    var sounds = '[';
    var pages = '[';

    for (var i = 0; i < this.numberOfPages; ++i)
    {
        values += '[';
        sounds += '[';

        var numSounds = this.config.pages[i].sounds.length;

        for (var j = 0; j < numSounds; ++j)
        {
            values += this.config.pages[i].sounds[j].rating;
            sounds += this.config.pages[i].sounds[j].name;

            if (j == numSounds - 1)
            {
                values += ']';
                sounds += ']';
            }
            else
            {
                values += ',';
                sounds += ',';
            }
        }


        pages += this.config.pages[i].name;
        if (i == this.numberOfPages - 1)
        {
            pages += ']';
            values += ']';
            sounds += ']';
        }
        else
        {
            pages += ',';
            values += '],';
            sounds += '],';
        }
    }

    // Append inputs to the form
    $('<input>').attr({
            type: 'hidden',
            name: 'fields[data]',
            value: values,
        }).appendTo ('div.submit-popup > form');

    $('<input>').attr({
            type: 'hidden',
            name: 'fields[sounds]',
            value: sounds,
        }).appendTo ('div.submit-popup > form');

    $('<input>').attr({
            type: 'hidden',
            name: 'fields[pages]',
            value: pages,
        }).appendTo ('div.submit-popup > form');

    $activePage ('.submit-popup').popup('open');
}
