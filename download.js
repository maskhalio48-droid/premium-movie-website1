/*
 * Tamilflix Download System
 * Downloads only authorized direct video files.
 */

(function () {
    "use strict";

    function isDirectVideoUrl(url) {
        try {
            const parsed = new URL(url);

            if (!["http:", "https:"].includes(parsed.protocol)) {
                return false;
            }

            return /\.(mp4|webm|mov|m4v)(?:$|[?#])/i.test(
                parsed.pathname + parsed.search + parsed.hash
            );
        } catch {
            return false;
        }
    }

    function createDownloadButton(videoUrl) {
        const button = document.createElement("button");

        button.type = "button";
        button.textContent = "⬇️ Download Video";
        button.className = "tamilflix-download-button";

        button.addEventListener("click", function () {
            if (!isDirectVideoUrl(videoUrl)) {
                alert(
                    "இந்த இணைப்பு நேரடி வீடியோ கோப்பு அல்ல. " +
                    "அனுமதிக்கப்பட்ட நேரடி MP4 அல்லது WebM இணைப்பைப் பயன்படுத்தவும்."
                );
                return;
            }

            const confirmed = confirm(
                "இந்த வீடியோவை download செய்ய உங்களுக்கு அனுமதி உள்ளதா?"
            );

            if (!confirmed) {
                return;
            }

            const link = document.createElement("a");

            link.href = videoUrl;
            link.target = "_blank";
            link.rel = "noopener noreferrer";

            /*
             * Cross-origin links may ignore the download attribute.
             * The hosting server must permit downloading.
             */
            link.download = "";
            document.body.appendChild(link);
            link.click();
            link.remove();
        });

        return button;
    }

    /*
     * Use this function when opening an authorized direct video.
     *
     * Example:
     * TamilflixDownload.addButton(
     *     document.getElementById("downloadArea"),
     *     "https://your-domain.example/movie.mp4"
     * );
     */
    window.TamilflixDownload = {
        isDirectVideoUrl,

        addButton: function (container, videoUrl) {
            if (!container || !videoUrl) {
                return;
            }

            container.replaceChildren(
                createDownloadButton(videoUrl)
            );
        }
    };
})();
