"""Fetch a YouTube playlist's public feed and print its videos as JSON.

Usage: python3 -I fetch_playlist.py <playlist_id>
Works for public and unlisted playlists. The feed lists the 15 most recent videos.
"""
import json
import sys
import urllib.request
import xml.etree.ElementTree as ET

NS = {
    "a": "http://www.w3.org/2005/Atom",
    "yt": "http://www.youtube.com/xml/schemas/2015",
}


def main(playlist_id: str) -> None:
    url = f"https://www.youtube.com/feeds/videos.xml?playlist_id={playlist_id}"
    with urllib.request.urlopen(url, timeout=30) as r:
        root = ET.fromstring(r.read())
    videos = []
    for e in root.findall("a:entry", NS):
        vid = e.findtext("yt:videoId", namespaces=NS)
        link = e.find("a:link", NS)
        videos.append({
            "videoId": vid,
            "title": e.findtext("a:title", namespaces=NS),
            "channel": e.findtext("a:author/a:name", namespaces=NS),
            "url": link.get("href") if link is not None else f"https://www.youtube.com/shorts/{vid}",
        })
    print(json.dumps(videos, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main(sys.argv[1])
