const cheerio = require('cheerio');
const request = require('request');

// Selector for all the main content links
const selector = '.mw-parser-output > p a, .mw-parser-output > ul a';

/**
 * Check if the url is valid
 * @param  {String}  url  Link to test
 * @return {Boolean}  True if the link is valid
 */
function _isOkLink(link, visited, path) {
  /**
   * Check that the link target has not been visited
   * is not a meta page
   * is not from wiktionary.org
   * is a wiki page
   */
  const url = link.attr('href');
  let isLinkOk =
    url !== undefined &&
    visited.indexOf(url) === -1 &&
    url.indexOf('Help:') === -1 &&
    url.indexOf('File:') === -1 &&
    url.indexOf('Wikipedia:') === -1 &&
    url.indexOf('wiktionary.org/') === -1 &&
    url.indexOf('/wiki/') !== -1;

  if (isLinkOk) {
    /**
     * Check if the link is between parenthesis
     */
    const contentHtml = link.closest('p').length > 0 ? link.closest('p').html() : '';
    if (contentHtml !== '') {
      const linkHtml = 'href="' + url + '"';
      const contentBeforeLink = contentHtml.split(linkHtml)[0];
      const openParenthesisCount = contentBeforeLink.split('(').length - 1;
      const closeParenthesisCount = contentBeforeLink.split(')').length - 1;
      isLinkOk = openParenthesisCount <= closeParenthesisCount;
    }
  }

  if (isLinkOk) {
    // Check that the link is not in italic
    isLinkOk = link.parents('i').length === 0;
  }

  return isLinkOk;
}

/**
 * Recursive function to go from a wikipedia page to the next by following the first link on page
 * @param  {String}  page  the Wikipedia page
 */
function processPage(page, visited, path, callback) {
  // Retrieve content from the url
  request(page, (error, response, body) => {
    // If we have an error we callback and return
    if (error || response.statusCode !== 200) {
      return callback(new Error('Article does not exist: ' + page), path);
    }

    // Let's parse the content !
    const $ = cheerio.load(body);

    // First check that the page is an actual article
    const content = $('#mw-content-text');
    const noArticle = $('.noarticletext');
    if (!!content.html() && !noArticle.html()) {
      let title = $('#firstHeading').text();
      // Add the title of the current page in the 'path' array
      path.push(title);

      // If we arrived at 'Philosophy', VICTORY ! We can callback and return
      if (title === 'Philosophy') {
        return callback(null, path);
      }

      let link, url;
      let i = 0;
      // If the link is not good, we iterate throught the next ones until we find a
      // good one !
      do {
        link = $(selector).eq(i);
        i = i + 1;
      } while ($(selector).length > 0 && !_isOkLink(link, visited, path));

      url = link.attr('href');
      if (url !== undefined) {
        visited.push(url);
        // Let's do all of this again
        processPage('http://en.wikipedia.com/' + url, visited, path, callback);
      } else {
        return callback(new Error('Cannot find a valid url on page: ' + page), path);
      }
    } else {
      // If it is not an actual Wikipedia article, callback error and return
      return callback(new Error('Article does not exist: ' + page), path);
    }
  });
}

/**
 * Start looping through Wikipedia pages until it reaches "Philosophy" article
 * @param  {String}  page  Starting page
 * @returns {Object} promise that will resolve with a path to "Philosophy" article
 * if reachable or reject with an error otherwise.
 */
exports.start = function start(page) {
  // Launch the recursive function
  const visited = [];
  const path = [];
  return new Promise((resolve, reject) => {
    processPage('http://en.wikipedia.com/wiki/' + page, visited, path, (err, path) => {
      if (err) {
        return reject(err);
      }

      return resolve(path);
    });
  });
};
