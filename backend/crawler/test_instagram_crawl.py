import instaloader

# Initialize Instaloader
loader = instaloader.Instaloader()

# Input the Instagram post URL
post_url = input("Enter the Instagram post URL: ")

# Extract the shortcode from the URL
shortcode = post_url.strip().split("/")[-2]

# Load the post
post = instaloader.Post.from_shortcode(loader.context, shortcode)

# Check if the post is a video
if post.is_video:
    print("This is a video post.")
    print("Caption:", post.caption)
    print("Video URL:", post.video_url)
else:
    print("This is an image post.")
    print("Caption:", post.caption)
    print("Image URL:", post.url)

# Download the post (it will download the video or image)
loader.download_post(post, target='downloaded_post')
