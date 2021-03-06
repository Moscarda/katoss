var utils   = require('../../src/utils'),
    kickass = require('kickass-torrent');

function searchEpisode (show, season, episode) {
    return new Promise((resolve, reject) => kickass(
        {
            url: 'https://kat.how',
            q:     utils.formatShowTitle(show) + ' S' + season + 'E' + episode,
            field: 'seeders',
            order: 'desc'
        },
        (err, data) => {
            if (err) {
                console.log('Kickass Torrents connection problem', err);
                return reject(err);
            }
            return resolve(data.list);
        }
    ));
}

function extractTorrentFilenameAndUrl (torrentInfo) {
    var urlMatches = torrentInfo.torrentLink.trim().match(/^(.+)\?title=(.+)$/);
    if (!urlMatches) {
        throw Error('URL and filename cannot be extracted from this URL ' + torrentInfo.torrentLink);
    }

    return {
        url:      urlMatches[1],
        filename: urlMatches[2] + '.torrent'
    };
}

module.exports = {
    searchEpisode:                searchEpisode,
    extractTorrentFilenameAndUrl: extractTorrentFilenameAndUrl
};
