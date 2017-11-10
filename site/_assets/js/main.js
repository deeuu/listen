import {$, activePage} from './dollar.js'
import {Soundboard} from './soundboard.js'

/*
 * Globals
 */

var Listen = window.Listen || {}


Listen.main = (config, layout) => {
  /*
   * Initial configuration
   */
  config = JSON.parse(config)

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

  /*
   * Main interface
   */

  switch (layout) {
    case 'soundboard':
      var currentInterface = new Soundboard(config)
      break
  }
}

window.Listen = Listen
