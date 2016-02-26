(function () {
    "use strict";

    WinJS.Namespace.define("settingsFlyout", {
        Save: Save,
        ReadSetSettings: readSetSettings
    });

    function Save() {
        var btnSave = document.getElementById("btnSave");
        var slika = document.getElementById("slika");

        btnSave.addEventListener("click", function (e) {
            var genres = new Array();
            for(var i=1; i<26; i++)
            {
                genres[i] = document.getElementById(""+i);
            }
            
            Windows.Storage.KnownFolders.documentsLibrary.createFileAsync("settingsfindmovie.txt", Windows.Storage.CreationCollisionOption.replaceExisting)
            .then(function (file) {
                var settingsText = "";
                if (document.getElementById("Show_on_startup").checked) {
                    settingsText += "Show,";
                }
                for(var j=1; j<26; j++)
                {
                    if(genres[j].checked == true)
                    {
                        settingsText += genres[j].value + ",";
                    }
                }
                var msg = new Windows.UI.Popups.MessageDialog("Settings saved");
                msg.showAsync();
                Windows.Storage.FileIO.writeTextAsync(file, settingsText);
            });
        });
    }

    function readSetSettings() {
        Windows.Storage.KnownFolders.documentsLibrary.createFileAsync("settingsfindmovie.txt", Windows.Storage.CreationCollisionOption.openIfExists)
        .then(function (file) {
            Windows.Storage.FileIO.readTextAsync(file).then(function (t) {
                var sett = t.split(",");
                if (sett[0] == "Show") {
                    document.getElementById("Show_on_startup").checked = true;
                }
                for (var i = 1; i <= 25; i++) {
                    if (sett[0] == "Show") {
                        for (var j = 1; j < sett.length; j++) {
                            if (document.getElementById(i).value == sett[j]) {
                                document.getElementById(i).checked = true;
                            }
                        }
                    }
                    else {
                        for (var j = 0; j < sett.length; j++) {
                            if (document.getElementById(i).value == sett[j]) {
                                document.getElementById(i).checked = true;
                            }
                        }
                    }
                }
            });
        });
    }
})();