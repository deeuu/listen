import {$, activePage} from './dollar.js'
import {AudioLoader} from './audioloader.js'
import * as utils from './utils.js'

export function Mushra (config) {
  activePage('.ui-content').find('*').off()

  this.config = config

  this.pageCounter = 0
  this.numberOfSounds = 0
  this.numberOfPages = this.config.pages.length
  this.currentPageSoundOrder = null

  if (this.config.add_consistency_check) {
    let idx = utils.randomNumber(0, this.numberOfPages, true)
    this.numberOfPages += 1
    let newPage = JSON.parse(JSON.stringify(this.config.pages[idx]))
    this.config.pages[idx].is_replicate = true
    newPage.is_replicate = true
    this.config.pages.push(newPage)
  }

  // this.numberOfPages + 1 so we can check if user has seen future pages
  this.have_seen_this_page_before = utils.arrayFilledWith(
  false, this.numberOfPages + 1)

  // Order of pages
  this.pageOrder = utils.fromAToBArray(0, this.numberOfPages)
  if (this.config.randomise_pages) {
    utils.shuffle(this.pageOrder)
  }

  /* Order of sounds within page (basically a list to map from slider index to a buffer,
   where first element is first slider)
  */
  this.soundOrder = []
  for (let i = 0; i < this.numberOfPages; ++i) {
    let numberOfSounds = this.config.pages[this.pageOrder[i]].sounds.length
    let order = utils.fromAToBArray(0, numberOfSounds)
    if (this.config.randomise_sounds_within_page) { utils.shuffle(order) }
    this.soundOrder.push(order)
  }

  this.configureButtons()
  this.updateTitle()
  this.loadPage()
}

Mushra.prototype.configureButtons = function () {
  // Store the next_url and then remove
  this.next_url = activePage('.next').attr('href')
  activePage('.next').removeAttr('href')

  activePage('.next').on('click', function (e) {
    if (
      this.loader.haveAllBuffersPlayed() ||
      !this.config.must_play_all_samples_to_continue ||
      this.have_seen_this_page_before[this.pageCounter + 1]) {
      this.onNextOrBackButtonClick(1)
    } else {
      activePage('.listen-to-all-samples-popup').popup('open')
      setTimeout(function () {
        activePage('.listen-to-all-samples-popup').popup('close')
      }, 5000)
    }
  }.bind(this))

  activePage('.back').on('click', function (e) {
    this.onNextOrBackButtonClick(-1)
  }.bind(this))

  // Stop audio
  activePage('.mushra-stop').on('click', function () {
    this.loader.stop()
  }.bind(this))

  // Reference
  activePage('.mushra-reference').on('click', function () {
    this.loader.play(this.numberOfSounds)
  }.bind(this))

  activePage('.mushra-sort').on('click', function () {
    this.sortSliders()
  }.bind(this))
}

Mushra.prototype.onNextOrBackButtonClick = function (direction) {
  if (this.loader) { this.loader.stop() }

  if (this.pageCounter === 0 && direction < 0) {
    if (this.config.back_button_can_exit_test) {
      window.history.back()
    }
  } else {
    activePage('.back').show()

    if (!this.have_seen_this_page_before[this.pageCounter]) {
      this.have_seen_this_page_before[this.pageCounter] = true
    }

    this.fillConfig()

    this.pageCounter = utils.selectMinimum(this.pageCounter + direction,
                                           this.numberOfPages)

    this.pageCounter = utils.selectMaximum(this.pageCounter, 0)

    // Complete or not
    if (this.pageCounter === this.numberOfPages) {
      this.complete()
      this.pageCounter -= 1
    } else {
      this.updateTitle()
      this.loadPage()
    }
  }
}

Mushra.prototype.updateTitle = function () {
  activePage('.title').html(
  (this.pageCounter + 1) + ' / ' + this.numberOfPages
  )
}

Mushra.prototype.loadPage = function () {
  this.currentPage = this.pageOrder[this.pageCounter]
  this.currentPageSoundOrder = this.soundOrder[this.pageCounter]
  this.numberOfSounds = this.currentPageSoundOrder.length

  this.urls = new Array(this.numberOfSounds)

  for (let i = 0; i < this.numberOfSounds; ++i) {
    let thisSound = this.config.pages[this.currentPage].sounds[i]
    this.urls[i] = this.config.siteURL + '/' + thisSound.url
  }

  // Add the url to the reference audio. No need to store id here.
  this.urls.push(this.config.siteURL + '/' + this.config.pages[this.currentPage].reference_url)

    // Configure the audio loader
  this.loader = new AudioLoader(this.urls,
                                this.config.continuous_playback,
                                this.config.loop_playback)

  activePage('.mushra-container').hide()
  this.loader.load(this.setupGUI.bind(this))
}

Mushra.prototype.setupGUI = function () {
  activePage('.mushra-container').show()

  this.createSliders()
}

Mushra.prototype.createSliders = function () {
  activePage('.mushra-slider-container').empty()

  for (let i = 0; i < this.numberOfSounds; ++i) {
    let startVal = 0
    if (this.have_seen_this_page_before[this.pageCounter]) {
      let loc = this.currentPageSoundOrder[i]
      startVal = this.config.pages[this.currentPage].sounds[loc].rating
    } else if (this.config.randomise_slider_handle) {
      startVal = utils.randomNumber(0, 100, true)
    }

    // The slider, triggers audio when user makes adjustment.
    let inputHTML = "<input type='range' name='slider' " +
      "value='" + startVal +
      "' min='0' max='100' step='1' class='ui-hidden-accessible' "

    if (this.config.show_number_on_slider) {
      inputHTML += "data-show-value='true'/>"
    } else {
      inputHTML += '/>'
    }

    activePage('.mushra-slider-container').append(inputHTML)
  }

  activePage('.mushra-slider-container').trigger('create')
  activePage('.mushra-slider-container').enhanceWithin()

  let mainObj = this

  activePage('.ui-slider').each(function (i) {
    // A filthy hack to give a more resticted response when the user clicks
    $(this).find('.ui-slider-handle').on('start', function () {
      let input = $(this).find('input')

      input.attr('min', input.val())
      input.attr('max', input.val())

      setTimeout(function () {
        input.attr('min', 0)
        input.attr('max', 100)
      }, 50)
    }.bind(this))

    $(this).off().on('slidestart', function (i) {
      // play this audio file
      mainObj.playBuf(i)

      // change handle colour when slider is moved
      $(this).find('.ui-slider-handle').addClass('slider-handle-active')
      // Give focus to the handle even if handle is clicked
      $(this).find('.ui-slider-handle').focus()
    }.bind(this, i))

    // Remove annoying popup displaying the value of the slider
    $(this).find('.ui-slider-handle').removeAttr('title')
    $(this).on('slidestop', function () {
      $(this).find('.ui-slider-handle').removeAttr('title')
    }.bind(this))
  })
}

Mushra.prototype.playBuf = function (i) {
  this.loader.play(this.currentPageSoundOrder[i])
}

Mushra.prototype.sortSliders = function () {
  this.loader.stop()

  let values = []
  activePage('.ui-slider input').each(function (i) {
    values.push(parseInt($(this).val()))
  })

  let indices = utils.indicesNeededToSortArray(values)

  let mainObj = this
  let tempOrder = this.currentPageSoundOrder.slice()

  activePage('.ui-slider').each(function (i) {
    mainObj.currentPageSoundOrder[i] = tempOrder[indices[i]]

    let idx = mainObj.currentPageSoundOrder[i]

    if (mainObj.loader.hasPlayed[idx]) {
      $(this).find('.ui-slider-handle').addClass('slider-handle-active')
    } else {
      $(this).find('.ui-slider-handle').removeClass('slider-handle-active')
    }

    $(this).find('input').val(values[indices[i]]).slider('refresh')

    $(this).find('.ui-slider-handle').removeAttr('title')
  })
}

Mushra.prototype.fillConfig = function () {
  let setRating = function (i, value) {
    let loc = this.currentPageSoundOrder[i]
    this.config.pages[this.currentPage].sounds[loc].rating = parseInt(value)
  }.bind(this)

  let dur = this.config.pages[this.currentPage].duration
  if ((dur === null) || (dur === 0)) {
    if (this.loader.timerStarted) {
      this.config.pages[this.currentPage].duration = this.loader.endTimer()
    } else {
      this.config.pages[this.currentPage].duration = 0
    }
  }

  this.config.pages[this.currentPage].order = this.pageCounter

  if (this.config.pages[this.currentPage].is_replicate == null) {
    this.config.pages[this.currentPage].is_replicate = false
  }

  activePage('.ui-slider input').each(function (i) {
    setRating(i, $(this).val())
  })
}

Mushra.prototype.complete = function () {
  var jsonString = JSON.stringify(this.config)

  if (this.config.allow_submission) {
    activePage('input[name="fields[data]"]').val(jsonString)
    activePage('.submit-popup').popup('open')
  } else {
    $.mobile.changePage(this.next_url)
  }
}
