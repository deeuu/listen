import {$, activePage} from './dollar.js'
import {Soundboard} from './soundboard.js'
import {Mushra} from './mushra.js'

function setup (config, siteURL) {
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

  config = JSON.parse(config)
  config.siteURL = siteURL
  return config
}

function createSoundboard (config, siteURL) {
  return new Soundboard(setup(config, siteURL))
}

function createMUSHRA (config, siteURL) {
  return new Mushra(setup(config, siteURL))
}

// Expose globally
window.listen = {
  createSoundboard: createSoundboard,
  createMUSHRA: createMUSHRA
}
