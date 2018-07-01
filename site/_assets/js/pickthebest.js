import {$, activePage} from './dollar.js'
import {AudioLoader} from './audioloader.js'
import {PageManager} from './pagemanager.js'
import * as utils from './utils.js'

export function PickTheBest (config) {
  PageManager.call (this, config)

  // Stop audio
  activePage('.stop-audio').on('click', function () {
    this.loader.stop(true)
  }.bind(this))
}

PickTheBest.prototype = Object.create(PageManager.prototype)
PickTheBest.prototype.constructor = PickTheBest

PickTheBest.prototype.setupGUI = function () {
  activePage('.interface-container').show()

  this.createReferences()
  this.createButtons()
}

PickTheBest.prototype.createReferences = function () {

  activePage('.references-container').empty()

  let button = "<a class='reference' data-role='button' data-inline='true'>"

  let references = this.config.pages[this.currentPage].references

  for (let i = 0; i < references.length; ++i)
  {
    activePage('.references-container').append(button +
      references[i].button_label + "</a>")
  }

  // Play references on click, we know they were added last
  let mainObj = this

  activePage('.reference').each(function (i) {

    $(this).on('click', function () {
      mainObj.loader.play(mainObj.numberOfSounds + i)
    })
  })

  activePage('.references-container').trigger('create')
  activePage('.references-container').enhanceWithin()
}

PickTheBest.prototype.createButtons = function () {
  activePage('.button-container').empty()

  // Button + checkbox
  for (let i = 0; i < this.numberOfSounds; ++i) {
    let checked = ''
    if (this.have_seen_this_page_before[this.pageCounter]) {
      let loc = this.currentPageSoundOrder[i]
      if (this.config.pages[this.currentPage].sounds[loc].value) {
        checked = 'checked'
      }
    }

    let num = i + 1
    let checkHTML = "<label data-iconpos='left'><input type='checkbox'" + 
          checked + "></label>"
    let buttonHTML = "<button class='test-button' data-inline='true'>" +
                     num + '</button>'

    let html = "<div class='checkbox-button-wrapper'>" + buttonHTML +
          checkHTML + "</div>"
    activePage('.button-container').append(html)
  }

  activePage('.button-container').trigger('create')
  activePage('.button-container').enhanceWithin()

  let mainObj = this

  activePage('.test-button').each(function (i) {
    $(this).on('click', function (i) {
      mainObj.playBuf(i)
    }.bind(null, i))
  })
}

PickTheBest.prototype.completeConfig = function () {
  let setValue = function (i, value) {
    let loc = this.currentPageSoundOrder[i]
    this.config.pages[this.currentPage].sounds[loc].value = value
  }.bind(this)

  activePage('[type=checkbox]').each(function (i) {
    let value = $(this).is(':checked')
    setValue(i, value)
  })
}

PickTheBest.prototype.interfaceDependentConditionsMet = function () {
  if (this.config.allow_ties) {
    return true
  } else {
    let values = []
    activePage('[type=checkbox]').each(function () {
      values.push($(this).is(':checked'))
    })

    let numChecked = values.reduce((x, y) => x + y)

    if (numChecked > 1) {
      activePage('.ties-warning-popup').popup('open')
      setTimeout(function () {
        activePage('.ties-warning-popup').popup('close')
      }, 5000)
      return false
    } else if (numChecked === 0) {
      activePage('.no-selection-warning-popup').popup('open')
      setTimeout(function () {
        activePage('.no-selection-warning-popup').popup('close')
      }, 5000)
      return false
    } else {
      return true
    }
  }
}
