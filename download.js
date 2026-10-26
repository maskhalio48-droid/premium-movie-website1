/* ==========================================
   TAMILFLIX - VIDEO DOWNLOAD
   Website Developed by Jayantha Dilan
========================================== */

"use strict";

(function () {
    const $ = id => document.getElementById(id);

    function isValidHttpUrl(value) {
        try {
            const url = new URL(value);

            return url.protocol === "https:" ||
                   url.protocol === "http:";
        } catch {
            return false;
        }
    }

    function isDirectVideoUrl(value) {
        if (!isValidHttpUrl(value)) return false;

        try {
            const url = new URL(value);
            const path = url.pathname.toLowerCase();

            return /\.(mp4|webm|ogv|mov|m4v)$/i.test(path);
        } catch {
            return false;
        }
    }

    function clearDownloadArea() {
        const area = $("downloadArea");

        if (!area) return;

        area.replaceChildren();
        area.classList.add("hidden");
    }

    function createDownloadButton(videoUrl, title) {
        const area = $("downloadArea");

        if (!area) return;

        clearDownloadArea();

        if (!isDirectVideoUrl(videoUrl)) {
            return;
        }

        const heading = document.createElement("p");

        heading.textContent =
            "Download is available only for direct video files you are authorized to download.";

        const link = document.createElement("a");

        link.href = videoUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "⬇️ Download Video";
        link.className = "btn btn-red";

        /*
         * Cross-origin downloads may open the video
         * instead of downloading it. The server hosting
         * the file must support downloads.
         */

        link.setAttribute("aria-label", "Open video download: " + title);

        area.append(heading, link);
        area.classList.remove("hidden");
    }

    function handlePlayerOpened(event) {
        const detail = event.detail || {};

        clearDownloadArea();

        if (!detail.videoUrl) return;

        createDownloadButton(
            detail.videoUrl,
            detail.title || "Tamilflix video"
        );
    }

    /*
     * Other scripts can call this function when
     * opening a movie player.
     */
    window.tamilflixCreateDownloadButton = createDownloadButton;
    window.tamilflixClearDownloadArea = clearDownloadArea;

    document.addEventListener(
        "tamilflix:player-opened",
        handlePlayerOpened
    );

    document.addEventListener("DOMContentLoaded", () => {
        clearDownloadArea();
    });
})();
