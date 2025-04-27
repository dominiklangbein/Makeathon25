from backend.crawler import instagram_crawler
from backend.checker import image_checker, video_checker
import uuid
import subprocess


def trigger_deeplink(job_id):
    deeplink = f"myapp://job/{job_id}"
    try:
        # Trigger the CLI command
        subprocess.run(["npx", "uri-scheme", "open", deeplink, "--ios"], check=True)
        print(f"Triggered deeplink: {deeplink}")
    except subprocess.CalledProcessError as e:
        print(f"Failed to trigger deeplink: {e}")


class FactCheckerService:
    def __init__(self, job_store):
        self.job_store = job_store

    def create_job(self, url):
        job_id = str(uuid.uuid4())
        self.job_store.save_job(job_id, {"status": "pending", "result": None, "url": url})
        return job_id

    def process_job(self, job_id, url):
        try:
            downloader = instagram_crawler.Downloader()
            instagram_content = downloader.fetch_instagram_post(url)
            content_url = instagram_content.content_url
            caption = instagram_content.caption

            if instagram_content.is_video:
                checker = video_checker.VideoChecker()
                result = checker.check_fake_news(content_url)
            else:
                checker = image_checker.ImageChecker()
                result = checker.check_for_fake_news(content_url, caption)

            # Update job result
            self.job_store.update_job(job_id, {"status": "done", "result": result})

            trigger_deeplink(job_id)

        except Exception as e:
            self.job_store.update_job(job_id, {"status": "error", "result": str(e)})


    def process_url(self, url):
        downloader = instagram_crawler.Downloader()
        instagram_content = downloader.fetch_instagram_post(url)
        content_url = instagram_content.content_url
        caption = instagram_content.caption

        if instagram_content.is_video:
            checker = video_checker.VideoChecker()
            result = checker.check_fake_news(content_url)
        else:
            checker = image_checker.ImageChecker()
            result = checker.check_for_fake_news(content_url, caption)

        return result

    def get_status(self, job_id):
        job = self.job_store.get_job(job_id)
        if not job:
            return None, None
        return job["status"], job["result"]


# job_store.py

class JobStore:
    def __init__(self):
        self.jobs = {}

    def save_job(self, job_id, data):
        self.jobs[job_id] = data

    def update_job(self, job_id, data):
        if job_id in self.jobs:
            self.jobs[job_id].update(data)

    def get_job(self, job_id):
        return self.jobs.get(job_id)

post_url = "https://www.instagram.com/p/DI60fuvsGef/"
tmp = FactCheckerService(JobStore())
#res = tmp.process_url(post_url)
#print(res)
