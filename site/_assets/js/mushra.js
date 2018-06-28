import {$, activePage} from './dollar.js'
import {AudioLoader} from './audioloader.js'
import {PageManager} from './pagemanager.js'
import * as utils from './utils.js'

export function Mushra (config) {
  PageManager.call (this, config)

  // Stop audio
  activePage('.mushra-stop').on('click', function () {
    this.loader.stop(true)
  }.bind(this))

  activePage('.mushra-sort').on('click', function () {
    this.sortSliders()
  }.bind(this))
}

Mushra.prototype = Object.create(PageManager.prototype)
Mushra.prototype.constructor = Mushra

Mushra.prototype.setupGUI = function () {
  activePage('.mushra-container').show()

  this.createReferences()
  this.createSliders()
}

Mushra.prototype.createReferences = function () {

  activePage('.mushra-references-container').empty()

  let button = "<a class='mushra-reference'" +
    "data-role='button' data-inline='true'>"

  let references = this.config.pages[this.currentPage].references

  for (let i = 0; i < references.length; ++i)
  {
    activePage('.mushra-references-container').append(button +
      references[i].button_label + "</a>")
  }

  // Play references on click, we know they were added last
  let mainObj = this

  activePage('.mushra-reference').each(function (i) {

    $(this).on('click', function () {
      mainObj.loader.play(mainObj.numberOfSounds + i)
    })
  })

  activePage('.mushra-references-container').trigger('create')
  activePage('.mushra-references-container').enhanceWithin()
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

Mushra.prototype.sortSliders = function () {
  this.loader.stop(true)

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

Mushra.prototype.completeConfig = function () {
  let setRating = function (i, value) {
    let loc = this.currentPageSoundOrder[i]
    this.config.pages[this.currentPage].sounds[loc].rating = parseInt(value)
  }.bind(this)

  activePage('.ui-slider input').each(function (i) {
    setRating(i, $(this).val())
  })
}

