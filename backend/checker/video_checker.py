from IPython.display import display, Image, Audio

import cv2  # We're using OpenCV to read video, to install !pip install opencv-python
import base64
import time
from openai import OpenAI
import os
import requests
import numpy as np
import cv2
from dotenv import load_dotenv
import tempfile

load_dotenv()
API_KEY = os.environ.get('OPENAI_KEY')

class VideoChecker:
    def check_fake_news(self, video_url: str):
        client = OpenAI(api_key=API_KEY)

        response = requests.get(video_url) #here is where streaming would be useful, if it works
        assert response.status_code == 200
        video_bytes = response.content

        #print(response.status_code, "\n", len(response.content)) -> seems fine
        #TODO: 1) check for efficiency in using stream (start processing images, before full video loaded)
        #TODO: 2) check if batch processing can be of advantage

        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp_file:
            tmp_file.write(video_bytes)
            tmp_filename = tmp_file.name

        print("Path: ", tmp_filename, "\n", "Size: ", os.path.getsize(tmp_filename) / 1024, "KB")  # -> seems fine

        video = cv2.VideoCapture(tmp_filename)  # open from temp file
        print("Is video opened?", video.isOpened())

        #frame_count = 0 #remove later
        base64Frames = []
        while video.isOpened():
            success, frame = video.read()
            if not success:
                break
            _, buffer = cv2.imencode(".jpg", frame)
            base64Frames.append(base64.b64encode(buffer).decode("utf-8"))

            #if frame_count % 100 == 0:
            #    cv2.imshow("Frame", frame)
            #    cv2.waitKey(500) -> frames seem to work

        video.release()
        print(len(base64Frames), "frames read")

        os.remove(tmp_filename)

        response = client.responses.create(
            model="gpt-4.1-mini",
            input=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_text",
                            "text": (
                                "These are frames from a video on Social Media. Analyze them and tell me if they are fake news. If the video has nothing to do with the topic, state that as well. Explain your thought process and choice."
                            )
                        },
                        *[
                            {
                                "type": "input_image",
                                "image_url": f"data:image/jpeg;base64,{frame}"
                            }
                            for frame in base64Frames[0::25]
                        ]
                    ]
                }
            ],
            temperature=0.0,
        )

        print(response.output_text)


test_video = VideoChecker()
test_video.check_fake_news("https://scontent-muc2-1.cdninstagram.com/o1/v/t16/f2/m86/AQNWaTdA78Ug5enthEKFs8veqUEMekOQRP-N7Py8i00R_s2y3vQft_StD0vwI7RCw3sei9g7a5OtIN128xN8SHLIwWWbc-1NCnC7Ico.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2xpcHMuYzIuNzIwLmJhc2VsaW5lIn0&_nc_cat=100&vs=672067241865076_1944884899&_nc_vs=HBksFQIYUmlnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC83NDRGQjE2RTVEMkRFNTc5NTNBRjVBMzY4QkU0RjY4MF92aWRlb19kYXNoaW5pdC5tcDQVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dPcFNKUjJ5SXdfNDZsMEVBQm9RbXdLdHJ3OV9icV9FQUFBRhUCAsgBACgAGAAbABUAACaEspuV3PLSPxUCKAJDMywXQCbdsi0OVgQYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HAA%3D%3D&ccb=9-4&oh=00_AfEL4YLCSTLWYvbCyJIxCtG6_HCrKfHQD7o2RN7iRRv4qA&oe=680E8F14&_nc_sid=d885a2")

