import {$, activePage} from './dollar.js'
import {AudioLoader} from './audioloader.js'
import * as utils from './utils.js'

export function PageManager (config) {
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

PageManager.prototype.interfaceDependentConditionsMet = function () {
  return true
}

PageManager.prototype.configureButtons = function () {
  // Store the next_url and then remove
  this.next_url = activePage('.next').attr('href')
  activePage('.next').removeAttr('href')

  activePage('.next').on('click', function (e) {
    if (
      this.loader.haveAllBuffersPlayed() ||
      !this.config.must_play_all_samples_to_continue ||
      this.have_seen_this_page_before[this.pageCounter + 1]) {
        if (this.interfaceDependentConditionsMet())
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

}

PageManager.prototype.onNextOrBackButtonClick = function (direction) {
  if (this.loader) { this.loader.stop(true) }

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

PageManager.prototype.updateTitle = function () {
  activePage('.title').html(
  (this.pageCounter + 1) + ' / ' + this.numberOfPages
  )
}

PageManager.prototype.loadPage = function () {
  this.currentPage = this.pageOrder[this.pageCounter]
  this.currentPageSoundOrder = this.soundOrder[this.pageCounter]
  this.numberOfSounds = this.currentPageSoundOrder.length

  this.urls = new Array(this.numberOfSounds)

  for (let i = 0; i < this.numberOfSounds; ++i) {
    let thisSound = this.config.pages[this.currentPage].sounds[i]
    this.urls[i] = this.config.siteURL + '/' + thisSound.url
  }

  // Add the url to the reference audio. No need to store id here.
  let references = this.config.pages[this.currentPage].references
  for (let i = 0; i < references.length; ++i)
  {
    this.urls.push(this.config.siteURL + '/' + references[i].url)
  }

  // Configure the audio loader
  this.loader = new AudioLoader(this.urls,
                                this.config.continuous_playback,
                                this.config.loop_playback)

  //activePage('.mushra-container').hide()

  this.loader.load(this.setupGUI.bind(this))
}

PageManager.prototype.setupGUI = function () {
}

PageManager.prototype.fillConfig = function () {

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

  this.completeConfig()
}

PageManager.prototype.completeConfig = function () {
}

PageManager.prototype.complete = function () {
  var jsonString = JSON.stringify(this.config)

  if (this.config.allow_submission) {
    activePage('input[name="fields[data]"]').val(jsonString)
    activePage('.submit-popup').popup('open')
  } else {
    $.mobile.changePage(this.next_url)
  }
}

PageManager.prototype.playBuf = function (i) {
  this.loader.play(this.currentPageSoundOrder[i])
}
