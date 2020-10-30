const url = require('url');
const UrlValueParser = require('url-value-parser');

/**
 * Normalizes urls paths.
 *
 * This function replaces route params like ids, with a placeholder, so we can
 * set the metrics label, correctly. E.g., both routes
 *
 * - /api/v1/user/1
 * - /api/v1/user/2
 *
 * represents the same logical route, and we want to group them together,
 * hence the need for the normalization.
 *
 * @param {!string} path - url path.
 * @param {Array} extraMasks - array of regexps which will replace
 * values in the URL.
 * @param {string} [placeholder='#val'] - the placeholder that will replace id
 * like params in the url path.
 * @returns {string} a normalized path, withoud ids.
 */
function normalizePath(originalUrl, extraMasks = [], placeholder = '#val') {
  const { pathname } = url.parse(originalUrl);
  const urlParser = new UrlValueParser({ extraMasks });
  return urlParser.replacePathValues(pathname, placeholder);
}

/**
 * Normalizes http status codes.
 *
 * Returns strings in the format StatusCode.
 *
 * @param {!number} status - status code of the requests
 * @returns {string} the normalized status code.
 */
function normalizeStatusCode(status) {
  return status;
}

module.exports = {
  normalizePath,
  normalizeStatusCode,
};
