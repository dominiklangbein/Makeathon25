import requests
from bs4 import BeautifulSoup
import re

# Input TikTok video URL
post_url = input("Enter the TikTok post URL: ")

# Headers (pretend to be a browser)
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}

# Get the TikTok page HTML
response = requests.get(post_url, headers=headers)
soup = BeautifulSoup(response.text, 'html.parser')

# Extract caption (meta tag)
caption_meta = soup.find("meta", attrs={"name": "description"})
caption = caption_meta["content"] if caption_meta else "No caption found"

# Extract video URL from JavaScript data
script_tag = soup.find("script", text=re.compile("downloadAddr"))
video_url = None
if script_tag:
    video_match = re.search(r'"downloadAddr":"(.*?)"', script_tag.string)
    if video_match:
        video_url = video_match.group(1).replace("\\u002F", "/")

if not video_url:
    raise Exception("Video URL not found!")

# Print the caption and video URL
print("Caption:", caption)
print("Video URL:", video_url)

# Download the video
video_response = requests.get(video_url, headers=headers)
with open("tiktok_video.mp4", "wb") as f:
    f.write(video_response.content)

print("Video downloaded as 'tiktok_video.mp4'")
