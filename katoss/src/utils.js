function allSettled (promiseList) {
    return new Promise(function (resolve) {
        var promiseDone  = function (response, error, index) {
                responseList[index] = { response: response, error: error };
                responseList.filter(function (response) {
                    return response !== undefined;
                })
                    .length === promiseCount && resolve(responseList);
            },
            responseList = [],
            promiseCount = promiseList.length;

        promiseList.forEach(function (promise, index) {
            promise.then(function (response) {
                promiseDone(response, null, index);
            }).catch(function (error) {
                promiseDone(null, error, index);
            });
        });
    });
}

function escapeRegExpPattern (string) {
    return string.replace(/[()<>[{\\|^$.*+?]/g, '\\$&');
}

function getLocationOrigin () {
    return window.location.origin || window.location.protocol + '//' + window.location.hostname +
        (window.location.port ? ':' + window.location.port : '');
}

function getFileExtension (filename) {
    return filename.trim().substr((~-filename.lastIndexOf('.') >>> 0) + 2).toLowerCase();
}

function fileExtensionIsMovie (filename) {
    var extension = getFileExtension(filename);
    return extension && ~['avi', 'mkv', 'mp4', 'mpg', 'mpeg'].indexOf(extension);
}

function formatShowTitle (show) {
    return show.trim().replace(/ ?\(\d{4}\)$/g, '').replace(/'|&|,|:/g, '').replace(/\./g, ' ').replace(/ +/g, ' ').trim();
}

function getDistribution (title) {
    var match = title.match(/HDTV|WEB.DL|WEB.?RIP|BRRIP|BDRIP|BLURAY/i);
    return match
        ? match[0].toUpperCase()
        .replace(/WEB.DL|WEB.?RIP/, 'WEB-DL')
        .replace(/BRRIP|BDRIP|BLURAY/, 'BLURAY')
        : 'UNKNOWN';
}

function getRipTeam (title) {
    var match,
        regexp;

    title = title.trim().toUpperCase().replace(/WEB(-(DL|RIP))/, ' $2');

    regexp = fileExtensionIsMovie(title) || getFileExtension(title) === 'srt'
        ? /-([^-]+?)( ?(\[.+?])+)?-?\.[A-Z0-9]+?$/
        : /-([^-]+?)( ?(\[.+?])+)?$/;

    match = title.match(regexp);
    return match ? match[1].trim().replace(/[^a-zA-Z0-9]/g, '') : 'UNKNOWN';
}

function formatRipTeam (ripTeam) {
    return ripTeam.replace('0', 'O');
}

function ripTeamMatchFoundInList (ripTeamList, searchedRipTeam) {
    var sameTeamList = [
        ['DIMENSION', 'LOL', 'SYS'],
        ['ASAP', 'XII', 'IMMERSE'],
        ['FQM', 'ORENJI']
    ];
    return ripTeamList.some(function (ripTeam) {
        if (ripTeam === searchedRipTeam) {
            return true;
        }

        var i = 0,
            l = sameTeamList.length,
            sameTeams;
        for (; i < l; i++) {
            sameTeams = sameTeamList[0];
            if (~sameTeams.indexOf(ripTeam)) {
                return ~sameTeams.indexOf(searchedRipTeam);
            }
        }

        return false;
    });
}

function getReleaseQualityFromAllowed (releaseName, allowedQualityList) {
    var qualityPattern = allowedQualityList.filter(function (quality) {
            return quality.toUpperCase() !== 'UNKNOWN';
        }).join('|'),
        match          = releaseName.match(new RegExp(qualityPattern, 'i'));

    return match ? match[0].toLowerCase() : 'UNKNOWN';
}

function releaseNameIsValid (releaseName, show, season, episode) {
    show = show.trim()
        .replace(/ ?\(\d{4}\)$/g, '')
        .replace(/([^A-Za-z0-9 &\.])/g, '$1?')
        .replace(/ ?& ?/g, '.+')
        .replace(/ +/g, '.')
        .replace(/\.+/g, '.')
        .replace(/\.$/, '');

    var reg = new RegExp('^' + show + '.+(S' + season + 'E' + episode + '|' + season + 'x' + episode + '|' +
        parseInt(season) + 'x' + episode + '|' + season + 'x' + parseInt(episode) + '|' +
        parseInt(season) + 'x' + parseInt(episode) + ')', 'i');
    return reg.test(releaseName.trim());
}

function qualityIsHigherThanCurrent (foundQuality, currentQuality, allowedQualityList) {
    if (!currentQuality) {
        return true;
    }

    currentQuality = getReleaseQualityFromAllowed(currentQuality, allowedQualityList);

    var foundQualityIndex = allowedQualityList.indexOf(foundQuality);

    return foundQualityIndex !== -1 && foundQualityIndex < allowedQualityList.indexOf(currentQuality);
}

var queue = {
    jobList:     [],
    concurrency: 5,
    activeJobs:  0,
    push:        function () {
        var jobs = Array.prototype.slice.call(arguments);
        Array.prototype.push.apply(this.jobList, jobs);
    },
    start:       function () {
        var jobs        = this.jobList.splice(0, this.concurrency);
        this.activeJobs = this.concurrency;

        jobs.forEach(function (job) {
            setTimeout(function () {
                job(this.next.bind(this));
            }.bind(this), 0);

        }.bind(this));
    },
    next:        function () {
        var jobs = this.jobList.splice(0, 1),
            job  = jobs[0];
        if (job) {
            setTimeout(function () {
                job(this.next.bind(this));
            }.bind(this), 0);
        }
        else {
            this.activeJobs--;
            if (this.activeJobs <= 0) {
                console.log('All jobs done.');
            }
        }
    }
};

module.exports = {
    allSettled:                   allSettled,
    escapeRegExpPattern:          escapeRegExpPattern,
    getLocationOrigin:            getLocationOrigin,
    getFileExtension:             getFileExtension,
    fileExtensionIsMovie:         fileExtensionIsMovie,
    formatShowTitle:              formatShowTitle,
    getDistribution:              getDistribution,
    getRipTeam:                   getRipTeam,
    formatRipTeam:                formatRipTeam,
    ripTeamMatchFoundInList:      ripTeamMatchFoundInList,
    getReleaseQualityFromAllowed: getReleaseQualityFromAllowed,
    releaseNameIsValid:           releaseNameIsValid,
    qualityIsHigherThanCurrent:   qualityIsHigherThanCurrent,
    queue:                        queue
};