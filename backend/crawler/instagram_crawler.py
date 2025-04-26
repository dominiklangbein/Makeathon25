import instaloader
import os
import uuid
from datetime import datetime
import requests
import base64


class InstagramPost:
    def __init__(self, caption, is_video, media_content):
        self.caption = caption
        self.is_video = is_video
        self.media_content = media_content  # Bytes of the media (image or video)

    def __str__(self):
        type_str = "Video" if self.is_video else "Image"
        return f"{type_str} Post - Caption: {self.caption[:30]}..."


def download_instagram_post(post_url, main_folder='instagram_downloads'):
    # Initialize Instaloader
    loader = instaloader.Instaloader()

    # Extract shortcode from URL
    shortcode = post_url.strip().split("/")[-2]

    # Load the post
    post = instaloader.Post.from_shortcode(loader.context, shortcode)

    # Create main folder if not exists
    if not os.path.exists(main_folder):
        os.makedirs(main_folder)

    # Generate a unique ID (timestamp + shortcode + random UUID)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    unique_id = f"{timestamp}_{shortcode}_{uuid.uuid4().hex[:6]}"

    # Create subfolder for this post
    subfolder_path = os.path.join(main_folder, unique_id)
    os.makedirs(subfolder_path, exist_ok=True)

    subfolder_path = os.path.join(main_folder)

    current_dir = os.getcwd()
    os.chdir(subfolder_path)

    # Download media (disable metadata file)
    loader.download_post(post, target=unique_id)

    # Change back to the original directory
    os.chdir(current_dir)

    print(f"Post saved in: {subfolder_path}")

    return unique_id


def fetch_instagram_post(post_url):
    # Initialize Instaloader
    loader = instaloader.Instaloader()

    # Extract shortcode
    shortcode = post_url.strip().split("/")[-2]

    # Load post
    post = instaloader.Post.from_shortcode(loader.context, shortcode)

    # Get media URL
    media_url = post.video_url if post.is_video else post.url

    # Download media content into memory (as bytes)
    response = requests.get(media_url)
    media_content = response.content  # This is the media in bytes

    # Encode media as Base64
    media_base64 = base64.b64encode(media_content).decode('utf-8')

    # Return InstagramPost object with media content in memory
    return InstagramPost(
        caption=post.caption or '',
        is_video=post.is_video,
        media_content=media_base64,
    )




# Example usage
post_url = "https://www.instagram.com/p/DIvPTGQTXNe/"
# download_instagram_post(post_url)

# Example usage

insta_post = fetch_instagram_post(post_url)
print(insta_post)
print(f"Media content size: {len(insta_post.media_content)} bytes")
