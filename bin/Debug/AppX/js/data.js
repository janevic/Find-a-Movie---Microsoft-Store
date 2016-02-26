(function () {
    "use strict";

    var list = new WinJS.Binding.List();
    var groupedItems = list.createGrouped(
        function groupKeySelector(item) { return item.group.key; },
        function groupDataSelector(item) { return item.group; }
    );

    


    // TODO: Replace the data with your real data.
    // You can add data from asynchronous sources whenever it becomes available.
    /*generateSampleData().forEach(function (item) {
        list.push(item);
    });*/

    // Get a reference for an item, using the group key and item title as a
    // unique reference to the item that can be easily serialized.
    function getItemReference(item) {
        return [item.group.key, item.title];
    }

    // This function returns a WinJS.Binding.List containing only the items
    // that belong to the provided group.
    function getItemsFromGroup(group) {
        return list.createFiltered(function (item) { return item.group.key === group.key; });
    }

    // Get the unique group corresponding to the provided group key.
    function resolveGroupReference(key) {
        for (var i = 0; i < groupedItems.groups.length; i++) {
            if (groupedItems.groups.getAt(i).key === key) {
                return groupedItems.groups.getAt(i);
            }
        }
    }

    // Get a unique item from the provided string array, which should contain a
    // group key and an item title.
    function resolveItemReference(reference) {
        for (var i = 0; i < groupedItems.length; i++) {
            var item = groupedItems.getAt(i);
            if (item.group.key === reference[0] && item.title === reference[1]) {
                return item;
            }
        }
    }
    
    ///////////////API KEY: 957dfd629fc1b1eb16c128548ae271b6///////////////////////
    ////API: https://api.themoviedb.org/3/movie/550?api_key=### /////////////////////
    var nowPlayingCount = 0;
    var nowPlaying = { key: "Now Playing", title: "Now Playing", backgroundImage: "images/now_ playing.jpg", description: "This group contains movies that are playing <br/>" };
    function getNowPlaying(group) {
        var search = group.title;
        WinJS.xhr({ url: "http://api.themoviedb.org/3/movie/now_playing?api_key=957dfd629fc1b1eb16c128548ae271b6" })
        .then(function complete(result) {
            var resourses = JSON.parse(result.response);
            group.description += "from: " + resourses.dates.minimum + "<br/>" + "to: " + resourses.dates.maximum;

            var pages = resourses.total_pages;
            for (var i = 1; i < pages/2; i++) {
                WinJS.xhr({ url: "http://api.themoviedb.org/3/movie/now_playing?api_key=957dfd629fc1b1eb16c128548ae271b6&page=" + i })
                .then(function complete2(result2) {
                    var page = JSON.parse(result2.response);
                    getDetailsAboutMovie(page, group);
                });
            }
        });
    }
    getNowPlaying(nowPlaying);
    var topRatedCount = 0;
    var topRated = { key: "Top Rated", title: "Top Rated", backgroundImage: "", description: "Top rated movies based on number of votes, votes and popularity of a movie." };
    function getTopRated(group) {
        WinJS.xhr({ url: "http://api.themoviedb.org/3/movie/top_rated?api_key=957dfd629fc1b1eb16c128548ae271b6" })
        .then(function complete(result) {
            var resourses = JSON.parse(result.response);
            var pages = resourses.total_pages;
            for (var i = 1; i < pages/5; i++) {
                WinJS.xhr({ url: "http://api.themoviedb.org/3/movie/top_rated?api_key=957dfd629fc1b1eb16c128548ae271b6&page=" + i })
                .then(function complete2(result2) {
                    var page = JSON.parse(result2.response);
                    group.backgroundImage = "images/top_rated.jpg";
                    getDetailsAboutMovie(page, group);
                });
            }
        });
    }
    getTopRated(topRated);
    
    var groupSearch = { key: "Search", title: "Search", backgroundImage: "images/search.png", description: "This group contains movies that are seached by you. After you close the application this group will be lost." };
    var numberOfItemsToPop = 0;
    var toPopFrom = 0;
    function getBySearchTitle(group) {
        if (numberOfItemsToPop != 0) {
            for (var i = 0; i < numberOfItemsToPop; i++) {
                list.pop();
            }
            numberOfItemsToPop = 0;
        }
        var title = group.title;
        WinJS.xhr({ url: "http://api.themoviedb.org/3/search/movie?api_key=957dfd629fc1b1eb16c128548ae271b6&query=" + title })
        .then(function complete(result) {
            var info = JSON.parse(result.response);
            numberOfItemsToPop = info.results.length;
            getDetailsAboutMovie(info, group);
        });
    }

    function getDetailsAboutMovie(page, group) {
        var results = page.results;
        for (var j = 0; j < results.length; j++) {
            var image = "https://image.tmdb.org/t/p/w300";
            var orginalTitle = "";
            var releaseDate = "";
            var poster = "";
            var vote = "";
            var voteCount = "";
            var popularity = "";
            var id = "";

            var content = "";
            var overview = "";

            if (results[j].backdrop_path != undefined) {
                image += results[j].backdrop_path;
            }
            else if (results[j].poster_path != undefined) {
                image = "https://image.tmdb.org/t/p/w780";
                image += results[j].poster_path;
            }
            else {
                image = "/images/NoPhotoAvailable.jpg";
            }

            if (results[j].original_title != undefined) {
                orginalTitle = results[j].original_title;
            }

            if (results[j].release_date != undefined) {
                releaseDate = results[j].release_date;
            }

            if (results[j].vote_average) {
                vote = results[j].vote_average;
            }

            if (results[j].vote_count != undefined) {
                voteCount = results[j].vote_count;
            }

            if (results[j].popularity != undefined) {
                popularity = results[j].popularity;
            }

            if (results[j].id != undefined) {
                id = results[j].id;
            }

            content += "<br/>Orginal title: " + orginalTitle + "<br/><br/>" + "Release date: " + releaseDate + "<br/><br/>" + "Raiting: " + vote + "<br/><br/>" + "Vote count: " + voteCount;

            if (popularity >= 15 && vote >= 7 && voteCount >= 100 && group.title == "Top Rated" && results[j].poster_path != undefined && topRatedCount < 10) {
                getMoviesByID(id, group, orginalTitle, overview, image, content);
                topRatedCount++;
            }
            else if (popularity >= 5 && group.title == "Now Playing" && results[j].poster_path != undefined && vote != 0 && voteCount != 0 && nowPlayingCount < 10) {
                getMoviesByID(id, group, orginalTitle, overview, image, content);
                nowPlayingCount++;
            }
            else if (group.title != "Now Playing" && group.title != "Top Rated" && results[j].poster_path != undefined && vote != 0 && voteCount != 0) {
                getMoviesByID(id, group, orginalTitle, overview, image, content);
            }
        }
    }

    function getMoviesByID(id, group, orginalTitle, overview, image, content) {
        WinJS.xhr({ url: "http://api.themoviedb.org/3/movie/" + id + "?api_key=957dfd629fc1b1eb16c128548ae271b6" })
        .then(function information(resultInfo) {
            var info = JSON.parse(resultInfo.response);

            var budget = "";
            var genres = "";
            var imdb_id = "";
            var production_companies = "";
            var production_countries = "";
            var runtime = "";

            if (info.budget != undefined) {
                budget = info.budget;

                if (budget == "0") {
                    budget = "/";
                }
            }
            else {
                budget = "/";
            }
            if (info.genres != undefined && info.genres.length > 0) {
                for (var k = 0; k < info.genres.length; k++) {
                    genres += info.genres[k].name;
                    genres += "\n";
                }
            }
            if (info.imdb_id != undefined) {
                imdb_id = info.imdb_id;
            }
            if (info.overview != undefined) {
                overview = info.overview;
            }
            if (info.production_companies != undefined && info.production_companies.length > 0) {
                for (var k = 0; k < info.production_companies.length; k++) {
                    production_companies = info.production_companies[k].name;
                    production_companies += "\n";
                }
            }
            if (info.production_countries != undefined && info.production_countries.length > 0) {
                for (var k = 0; k < info.production_countries.length; k++) {
                    production_countries = info.production_countries[k].name;
                    production_countries += "\n";
                }
            }
            if (info.runtime != undefined) {
                runtime = info.runtime;
            }

            var credits = "";
            WinJS.xhr({ url: "http://api.themoviedb.org/3/movie/" + id + "/credits?api_key=957dfd629fc1b1eb16c128548ae271b6" })
            .then(function information(resultInfo) {
                var info = JSON.parse(resultInfo.response);

                var cast = "";
                var crew = "";

                if (info.cast != undefined) {
                    for (var k = 0; k < info.cast.length; k++) {
                        cast += info.cast[k].name + " as " + info.cast[k].character + "<br/>";
                    }
                }

                if (info.crew != undefined) {
                    for (var k = 0; k < info.crew.length; k++) {
                        crew += info.crew[k].job + ": " + info.crew[k].name + "<br/>";
                    }
                }

                credits = cast + "<br/><br/>" + crew;

                content += "<br/><br/>" + "Budget: " + budget + "<br/><br/>" + "Genres: " + genres + "<br/><br/>" + "IMDB ID: " + imdb_id + "<br/><br/>" + "Production companies: " + production_companies + "<br/><br/>" + "Production countries: " + production_countries + "<br/><br/>" + "Runtime: " + runtime + " minutes" + "<br/><br/>" + "Overview: " + overview + "<br/><br/>" + credits;

                list.push({ group: group, title: orginalTitle, subtitle: "Movie ID: " + id, description: overview, content: content, backgroundImage: image });
            });
        });
    }

    WinJS.Namespace.define("Data", {
        items: groupedItems,
        groups: groupedItems.groups,
        getItemReference: getItemReference,
        getItemsFromGroup: getItemsFromGroup,
        resolveGroupReference: resolveGroupReference,
        resolveItemReference: resolveItemReference,
        getBySearchTitle: getBySearchTitle,
        groupSearch: groupSearch
    });

})();
