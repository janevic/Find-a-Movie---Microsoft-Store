(function () {
    "use strict";

    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var nav = WinJS.Navigation;
    var ui = WinJS.UI;
    var click = false;
    var listNext = new Array();
    var i = 0;
    var pages = 1;

    ui.Pages.define("/pages/groupedItems/groupedItems.html", {
        // Navigates to the groupHeaderPage. Called from the groupHeaders,
        // keyboard shortcut and iteminvoked.
        navigateToGroup: function (key) {
            nav.navigate("/pages/groupDetail/groupDetail.html", { groupKey: key });
        },

        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            var listView = element.querySelector(".groupeditemslist").winControl;
            listView.groupHeaderTemplate = element.querySelector(".headertemplate");
            listView.itemTemplate = element.querySelector(".itemtemplate");
            listView.oniteminvoked = this._itemInvoked.bind(this);

            // Set up a keyboard shortcut (ctrl + alt + g) to navigate to the
            // current group when not in snapped mode.
            listView.addEventListener("keydown", function (e) {
                if (appView.value !== appViewState.snapped && e.ctrlKey && e.keyCode === WinJS.Utilities.Key.g && e.altKey) {
                    var data = listView.itemDataSource.list.getAt(listView.currentItem.index);
                    this.navigateToGroup(data.group.key);
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            }.bind(this), true);

            this._initializeLayout(listView, appView.value);
            listView.element.focus();

            ////////////////////////////////

            if (!click) {
                Windows.Storage.KnownFolders.documentsLibrary.createFileAsync("settingsfindmovie.txt", Windows.Storage.CreationCollisionOption.openIfExists)
                .then(function (file) {
                    Windows.Storage.FileIO.readTextAsync(file).then(function (t) {
                        var sett = t.split(",");
                        if (sett[0] == "Show") {
                            document.getElementById("divPropose").style.visibility = "visible";
                            getProposedMovie();
                        }
                    });
                });
            }

            var btn = document.getElementById("button");
            btn.addEventListener("click", function (e) {
                document.getElementById("divPropose").style.visibility = "visible";
                getProposedMovie();
            });

            var btnNext = document.getElementById("btnNext");
            btnNext.addEventListener("click", function (e) {
                listNext.push(document.getElementById("movieName").innerText);
                if (i < 20) {
                    getProposedMovie();
                }
                else {
                    pages++;
                    i = 0;
                    getProposedMovie();
                }
            });

            var btnAddToWatched = document.getElementById("btnAddWathedPopup");
            btnAddToWatched.addEventListener("click", function (e) {
                if (document.getElementById("movieName").innerText.toString().trim() != "") {
                    Windows.Storage.KnownFolders.documentsLibrary.createFileAsync("watchedfindmovie.txt", Windows.Storage.CreationCollisionOption.openIfExists)
                    .then(function (file) {
                        Windows.Storage.FileIO.readTextAsync(file).then(function (t) {
                            var str = t.toString();
                            var strDel = str.split("#");
                            var imaFilm = false;
                            for (var k = 0; k < strDel.length; k++) {
                                if (strDel[k] == document.getElementById("movieName").innerText.toString()) {
                                    imaFilm = true;
                                }
                            }
                            if (imaFilm) {
                                var msg = Windows.UI.Popups.MessageDialog(document.getElementById("movieName").innerText.toString() + " is already added into watched movies");
                                msg.showAsync();
                            }
                            else {
                                Windows.Storage.FileIO.appendTextAsync(file, document.getElementById("movieName").innerText.toString() + "#");
                            }
                        });
                    });
                }
                else {
                    var msg = Windows.UI.Popups.MessageDialog("There are no movies in this section.\nFor more movies please change your settings.");
                    msg.showAsync();
                }
            });


            function getProposedMovie() {
                Windows.Storage.KnownFolders.documentsLibrary.createFileAsync("settingsfindmovie.txt", Windows.Storage.CreationCollisionOption.openIfExists)
                .then(function (file) {
                    Windows.Storage.FileIO.readTextAsync(file).then(function (t) {
                        var genres = "";
                        var sett = t.split(",");
                        if (sett[0] == "Show") {
                            for (var r = 1; r < sett.length; r++) {
                                genres += sett[r] + ",";
                            }
                        }
                        else {
                            for (var r = 0; r < sett.length; r++) {
                                genres += sett[r] + ",";
                            }
                        }
                        var link = "http://api.themoviedb.org/3/discover/movie?api_key=957dfd629fc1b1eb16c128548ae271b6&sort_by=popularity.desc&vote_count.gte=50&";
                        if (genres != "") {
                            link += "with_genres=" + genres + "&page=" + pages;
                        }
                        else {
                            link += "page=" + pages;
                        }
                        WinJS.xhr({ url: link })
                        .then(function complete2(result2) {
                            var page = JSON.parse(result2.response);
                            var results = page.results;
                            var watchedMovie = false;
                            if (i < results.length) {
                                if (page.results[i].original_title != undefined && page.results[i].original_title != null) {
                                    Windows.Storage.KnownFolders.documentsLibrary.createFileAsync("watchedfindmovie.txt", Windows.Storage.CreationCollisionOption.openIfExists)
                                    .then(function (file) {
                                        Windows.Storage.FileIO.readTextAsync(file).then(function (t) {
                                            var str = t.toString();
                                            var strDel = str.split("#");
                                            if (i < results.length) {
                                                if (str.length > 0) {
                                                    for (var j = 0; j < str.length; j++) {
                                                        if (page.results[i].original_title == strDel[j]) {
                                                            watchedMovie = true;
                                                            i++;
                                                            getProposedMovie();
                                                        }
                                                    }
                                                }
                                                if (listNext.length > 0) {
                                                    for (var p = 0; p < listNext.length; p++) {
                                                        if (listNext[p] == page.results[i].original_title) {
                                                            watchedMovie = true;
                                                            i++;
                                                            getProposedMovie();
                                                        }
                                                    }
                                                }
                                                if (watchedMovie == false) {
                                                    WinJS.xhr({ url: "http://api.themoviedb.org/3/movie/" + page.results[i].id + "?api_key=957dfd629fc1b1eb16c128548ae271b6" })
                                                    .then(function complete(result) {
                                                        var resourses = JSON.parse(result.response);

                                                        document.getElementById("movieBudget").innerText = resourses.budget;
                                                        document.getElementById("movieName").innerText = resourses.original_title;
                                                        if (resourses.poster_path != undefined) {
                                                            document.getElementById("picture").src = "https://image.tmdb.org/t/p/w500" + resourses.poster_path;
                                                        }
                                                        else {
                                                            document.getElementById("picture").src = "/images/NoPhotoAvailable.jpg";
                                                        }
                                                        document.getElementById("imdbID").innerText = resourses.imdb_id;
                                                        document.getElementById("releaseDate").innerText = resourses.release_date;
                                                        document.getElementById("movieRating").innerText = resourses.vote_average;

                                                        var genresS = "";
                                                        if (resourses.genres != undefined) {
                                                            for (var w = 0; w < resourses.genres.length; w++) {
                                                                genresS += resourses.genres[w].name + "  ";
                                                            }
                                                        }
                                                        document.getElementById("movieGernes").innerText = genresS;
                                                        document.getElementById("movieRuntime").innerText = resourses.runtime;
                                                        document.getElementById("movieOverview").innerText = resourses.overview;

                                                        var roles = "";
                                                        var movieDirector = "";
                                                        var movieWriter = "";
                                                        var movieProducer = "";

                                                        WinJS.xhr({ url: "http://api.themoviedb.org/3/movie/" + resourses.id + "/credits?api_key=957dfd629fc1b1eb16c128548ae271b6" })
                                                        .then(function information(resultInfo) {
                                                            var info = JSON.parse(resultInfo.response);
                                                            if (info.cast != undefined) {
                                                                if (info.cast.length > 5) {
                                                                    for (var k = 0; k < 5; k++) {
                                                                        roles += info.cast[k].name + " as " + info.cast[k].character + "\n";
                                                                    }
                                                                    roles += "...";
                                                                }
                                                                else {
                                                                    for (var k = 0; k < info.cast.length; k++) {
                                                                        roles += info.cast[k].name + " as " + info.cast[k].character + "\n";
                                                                    }
                                                                }
                                                            }
                                                            if (info.crew != undefined) {
                                                                for (var k = 0; k < info.crew.length; k++) {
                                                                    if (info.crew[k].job == "Director") {
                                                                        movieDirector += info.crew[k].name + "\n";
                                                                    }
                                                                    if (info.crew[k].job == "Producer") {
                                                                        movieProducer += info.crew[k].name + "\n";
                                                                    }
                                                                }
                                                            }
                                                            document.getElementById("movieRoles").innerText = roles;
                                                            document.getElementById("movieDirector").innerText = movieDirector;
                                                            document.getElementById("movieProducer").innerText = movieProducer;
                                                        });
                                                    });
                                                    i++;
                                                }
                                                watchedMovie = false;
                                            }
                                        });
                                    });
                                }
                            }
                            else {
                                document.getElementById("picture").src = "/images/NoPhotoAvailable.jpg";
                                var msg = Windows.UI.Popups.MessageDialog("There are no more movies in this section.\nFor more movies please change your settings.");
                                msg.showAsync();
                            }
                        });
                    });
                });
            }

            var popupClose = document.getElementById("btnClosePopup");
            popupClose.addEventListener("click", function (e) {
                document.getElementById("divPropose").style.visibility = "hidden";
                click = true;

                document.getElementById("picture").src = "/images/NoPhotoAvailable.jpg";
                document.getElementById("movieBudget").innerText = "";
                document.getElementById("movieName").innerText = "";
                document.getElementById("imdbID").innerText = "";
                document.getElementById("releaseDate").innerText = "";
                document.getElementById("movieRating").innerText = "";
                document.getElementById("movieGernes").innerText = "";
                document.getElementById("movieRuntime").innerText = "";
                document.getElementById("movieOverview").innerText = "";
                document.getElementById("movieRoles").innerText = "";
                document.getElementById("movieDirector").innerText = "";
                document.getElementById("movieProducer").innerText = "";
            });

        },

        // This function updates the page layout in response to viewState changes.
        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            var listView = element.querySelector(".groupeditemslist").winControl;
            if (lastViewState !== viewState) {
                if (lastViewState === appViewState.snapped || viewState === appViewState.snapped) {
                    var handler = function (e) {
                        listView.removeEventListener("contentanimating", handler, false);
                        e.preventDefault();
                    }
                    listView.addEventListener("contentanimating", handler, false);
                    this._initializeLayout(listView, viewState);
                }
            }
        },

        // This function updates the ListView with new layouts
        _initializeLayout: function (listView, viewState) {
            /// <param name="listView" value="WinJS.UI.ListView.prototype" />

            if (viewState === appViewState.snapped) {
                listView.itemDataSource = Data.groups.dataSource;
                listView.groupDataSource = null;
                listView.layout = new ui.ListLayout();
            } else {
                listView.itemDataSource = Data.items.dataSource;
                listView.groupDataSource = Data.groups.dataSource;
                listView.layout = new ui.GridLayout({ groupHeaderPosition: "top" });
            }
        },

        _itemInvoked: function (args) {
            if (appView.value === appViewState.snapped) {
                // If the page is snapped, the user invoked a group.
                var group = Data.groups.getAt(args.detail.itemIndex);
                this.navigateToGroup(group.key);
            } else {
                // If the page is not snapped, the user invoked an item.
                var item = Data.items.getAt(args.detail.itemIndex);
                nav.navigate("/pages/itemDetail/itemDetail.html", { item: Data.getItemReference(item) });
            }
        }
    });
})();
