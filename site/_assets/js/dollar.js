export const $ = window.jQuery

export function activePage (query = '') {
  return $('.ui-page-active ' + query)
}
