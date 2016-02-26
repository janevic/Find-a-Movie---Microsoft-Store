(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/itemDetail/itemDetail.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            var item = options && options.item ? Data.resolveItemReference(options.item) : Data.items.getAt(0);
            element.querySelector(".titlearea .pagetitle").textContent = item.group.title;
            element.querySelector("article .item-title").textContent = item.title;
            element.querySelector("article .item-subtitle").textContent = item.subtitle;
            element.querySelector("article .item-image").src = item.backgroundImage;
            element.querySelector("article .item-image").alt = item.subtitle;
            element.querySelector("article .item-content").innerHTML = item.content;
            element.querySelector(".content").focus();

            var btn = document.getElementById("btnWatched");

            btn.addEventListener("click", function (e) {
                Windows.Storage.KnownFolders.documentsLibrary.createFileAsync("watchedfindmovie.txt", Windows.Storage.CreationCollisionOption.openIfExists)
                .then(function (file) {
                    Windows.Storage.FileIO.readTextAsync(file).then(function (t) {
                        var str = t.toString();
                        var strDel = str.split("#");
                        var imaFilm = false;
                        for (var i = 0; i < strDel.length; i++) {
                            if (strDel[i] == item.title) {
                                imaFilm = true;
                            }
                        }
                        if (imaFilm) {
                            var msg = Windows.UI.Popups.MessageDialog(item.title + " is already added into watched movies");
                            msg.showAsync();
                        }
                        else {
                            Windows.Storage.FileIO.appendTextAsync(file, item.title + "#");
                        }
                    });
                });
            });
        }
    });
})();
