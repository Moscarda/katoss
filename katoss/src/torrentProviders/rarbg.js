var utils = require('../../src/utils'),
    rarbg = require('../../../lib/rarbgto-api.min');

function searchEpisode (show, season, episode) {
    return rarbg.search(utils.formatShowTitle(show) + ' S' + season + 'E' + episode, {
        category:          'tv',
        order:             'seeders',
        by:                'DESC',
        page:              1,
        retrieveSubtitles: true
    }).then(response => response.results);
}

function extractTorrentFilenameAndUrl (torrentInfo) {
    return torrentInfo;
}

module.exports = {
    searchEpisode:                searchEpisode,
    extractTorrentFilenameAndUrl: extractTorrentFilenameAndUrl
};
