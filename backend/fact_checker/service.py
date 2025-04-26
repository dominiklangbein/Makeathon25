import backend.crawler.instagram_crawler as instagram_crawler
import backend.checker.image_checker as image_checker
import backend.checker.video_checker as video_checker



def check_url(url):
    downloader = instagram_crawler.Downloader()

    instagram_content = downloader.fetch_instagram_post(url)
    res = ''
    content_url = instagram_content.content_url
    if instagram_content.is_video:
        # Video checker
        fake_checker = video_checker.VideoChecker()
        res = fake_checker.check_fake_news(content_url)
    else:
        # Image checker
        fake_checker = image_checker.ImageChecker()
        res = fake_checker.check_for_fake_news(content_url, instagram_content.caption)

    return res


url = "https://www.instagram.com/p/DI6iGH7st25/?utm_source=ig_web_copy_link"
print(check_url(url))
print("Finished")
