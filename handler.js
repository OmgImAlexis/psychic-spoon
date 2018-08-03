const {tvdb} = require('./scene_exceptions_tvdb.json');
const {tmdb} = require('./scene_exceptions_tmdb.json');
const {tvmaze} = require('./scene_exceptions_tvmaze.json');

const sceneExceptions = {
    tvdb,
    tmdb,
    tvmaze
};

module.exports = (context, callback) => {
    let realExceptions = {};
    context = context.trim();
    if (context !== '') {
        const shows = context.split(',').map(show => show.trim());
        shows.map(show => {
            const match = show.match(/tvdb|tmdb|tvmaze/g);
            if (!match) return;
            const indexer = match[0];
            let showId = show.replace(indexer, '');
            let data;
            let seasons;
            
            // : is used for season specificness
            if (showId.includes(':')) {
                const idsAndSeasons = showId.split(':');
                showId = idsAndSeasons.splice(0, 1)[0];
                seasons = idsAndSeasons;
            }
            
            // If indexer or showId is missing then don't set data
            if (Object.keys(sceneExceptions).includes(indexer) && Object.keys(sceneExceptions[indexer]).includes(showId) >= 0) {
                if (seasons) {
                    data = Object.keys(sceneExceptions[indexer][showId]).filter(season => {
                        return seasons.includes(season);
                    }).map(season => {
                        return sceneExceptions[indexer][showId][season];
                    });
                } else {
                    data = sceneExceptions[indexer][showId];
                }
            }
            
            return {
                [indexer + showId]: data
            };
        }).forEach(show => {
            if (!show) return;
            const data = Object.keys(show)[0];
            const indexer = data.match(/tvdb|tmdb|tvmaze/g)[0];
            const showId = data.replace(indexer, '');
            
            if (!Object.keys(realExceptions).includes(indexer)) realExceptions[indexer] = {};

            realExceptions[indexer][showId] = show[data];
        });
    }
    
    callback(undefined, Object.keys(realExceptions).length >= 1 ? realExceptions : sceneExceptions);
}
