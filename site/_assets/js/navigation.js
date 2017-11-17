import {$, activePage} from './dollar.js'

// Menu
$(function () {
  $(function () {
    $('nav ul li > a:not(:only-child)').click(function (e) {
      $(this).siblings('.nav-dropdown').toggle()
      $('.nav-dropdown').not($(this).siblings()).hide()
      e.stopPropagation()
    })

    $('html').click(function () {
      $('.nav-dropdown').hide()
    })
  })

  document.querySelector('#nav-toggle').addEventListener('click', function () {
    this.classList.toggle('active')
  })

  $('#nav-toggle').click(function () {
    $('nav ul').toggle()
  })
})

// hide back button if there isn't anywhere to go
$(document).on('pageshow', function (e) {
  if (window.history.length === 1 || $.mobile.navigate.history.activeIndex === 0) {
    activePage('.back').hide()
  }
})
