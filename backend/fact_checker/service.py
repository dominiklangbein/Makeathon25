import backend.crawler.instagram_crawler as instagram_crawler


def check_url(str: url):
    downloader = instagram_crawler.Downloader()

    url = str