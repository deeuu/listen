import {$, activePage} from './dollar.js'
import {Soundboard} from './soundboard.js'
import {Mushra} from './mushra.js'

/*
 * Globals
 */
function setup (config) {
  // Undo previous bindings:
  activePage('.next').off()
  activePage('.back').off()
  $('.ui-content').find('*').off()

  // Show loading spinner when user clicks submit
  $('.submit-form').on('submit', function () {
    $.mobile.loading('show')
  })

  $('.submit-form .cancel').on('click', function () {
    $('.submit-popup').popup('close')
  })

  return JSON.parse(config)
}

function createSoundboard (config) {
  return new Soundboard(setup(config))
}

function createMUSHRA (config) {
  return new Mushra(setup(config))
}

window.listen = {
  createSoundboard: createSoundboard,
  createMUSHRA: createMUSHRA
}
