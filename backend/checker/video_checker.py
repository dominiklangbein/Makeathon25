from IPython.display import display, Image, Audio

import cv2  # We're using OpenCV to read video, to install !pip install opencv-python
import base64
from openai import OpenAI, api_key
import os
import requests
import cv2
from dotenv import load_dotenv
import tempfile
from moviepy import VideoFileClip
import math
import re
import markdown

load_dotenv()
API_KEY = os.environ.get('OPENAI_KEY')

def clean_markdown_block(md_text):
    cleaned = re.sub(r'^```[ ]*markdown[ ]*\n', '```', md_text, flags=re.IGNORECASE)
    return cleaned

def is_valid_markdown(md_text):
    try:
        html = markdown.markdown(md_text)
        return bool(html.strip())
    except Exception:
        return False

def extract_number_and_clean(md_text):
    # Step 1: Find the last triple backticks
    last_backticks = md_text.rfind("```")

    if last_backticks == -1:
        # No triple backticks at all
        cleaned_md = clean_markdown_block(md_text)
        return cleaned_md, None

    # Step 2: Split content: Markdown block and possible number after
    markdown_part = md_text[:last_backticks + 3]  # include ```
    remainder = md_text[last_backticks + 3:].strip()

    # Step 3: Try to find a number in the remainder
    number_match = re.match(r'^(\d+)', remainder)  # start of remainder must be digits

    if number_match:
        extracted_number = int(number_match.group(1))
    else:
        extracted_number = None

    # Step 4: Clean the markdown block
    cleaned_md = clean_markdown_block(markdown_part)

    return cleaned_md, extracted_number

class VideoChecker:
    def check_fake_news(self, video_url: str):
        client = OpenAI(api_key=API_KEY)

        response = requests.get(video_url) #here is where streaming would be useful, if it works
        #assert response.status_code == 200
        video_bytes = response.content

        #print(response.status_code, "\n", len(response.content)) -> seems fine
        #TODO: check for efficiency in using stream (start processing images, before full video loaded)

        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp_file:
            tmp_file.write(video_bytes)
            tmp_filename = tmp_file.name

        print("Path: ", tmp_filename, "\n", "Size: ", os.path.getsize(tmp_filename) / 1024, "KB")  # -> seems fine

        video = cv2.VideoCapture(tmp_filename)  # open from temp file
        print("Is video opened?", video.isOpened())

        audio_clip = VideoFileClip(tmp_filename).audio
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_audio_file:
            audio_clip.write_audiofile(tmp_audio_file.name, codec='pcm_s16le')
            tmp_audio_filename = tmp_audio_file.name

        transcription = client.audio.transcriptions.create(
            model="gpt-4o-transcribe",
            file=open(tmp_audio_filename, "rb"),
        )

        base64Frames = []
        while video.isOpened():
            success, frame = video.read()
            if not success:
                break
            _, buffer = cv2.imencode(".jpg", frame)
            base64Frames.append(base64.b64encode(buffer).decode("utf-8"))


            #if frame_count % 100 == 0:
            #    cv2.imshow("Frame", frame)
            #    cv2.waitKey(500) #-> frames seem to work

        fps = video.get(cv2.CAP_PROP_FPS)
        frame_count = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
        duration_seconds = frame_count / fps
        print("FPS: ", fps, "\nFrames: ", frame_count, "\nDuration: ", duration_seconds)


        #TODO: instead of here, do this immediately in the video split
        if duration_seconds < 10:
            in_between_frames = 5
        elif duration_seconds < 60:
            in_between_frames = 25
        else:
            in_between_frames = 50

        audio_clip.close()
        video.release()
        print(len(base64Frames), "frames read")

        os.remove(tmp_filename)
        os.remove(tmp_audio_filename)

        response = client.responses.create(
            model="gpt-4.1",
            input=[
                {
                    "role": "system",
                    "content": [
                        {
                            "type": "input_text",
                            "text": (
                                "You are a sophisticated AI that analyzes videos for fake news detection. Please provide your analysis in the following structure, wrapped within a Markdown format (as shown below):\n\n"
                                f"```1. **Fake News or Not:** (Yes/No)\n2. **Reasoning:** (Why or why not the content is fake news)\n3. **Supporting Evidence:** (Based on the visuals and transcription, list any clear evidence for your conclusion)\n4. **Sources:** (List any of the online sources you may have used)\n5. **Conclusion:** (State your conclusion here)```"
                            )
                        },
                        {
                            "type": "input_text",
                            "text": (
                                "At the very end of your reply, after the Markdown output, add a number in percent, of how confidence you are this is fake news. Leave out the percent sign and just give me the number."
                            )
                        }
                    ]
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_text",
                            "text": (
                                "These are frames from a video on Social Media. Analyze them and tell me if they are fake news. If the video has nothing to do with the topic, state that as well. Explain your thought process and choice."
                            )
                        },
                        {
                            "type": "input_text",
                            "text": (
                                f"Additionally, here is the transcript: {transcription.text}"
                            )
                        },
                        *[
                            {
                                "type": "input_image",
                                "image_url": f"data:image/jpeg;base64,{frame}"
                            }
                            for frame in base64Frames[0::in_between_frames] #originally 0::25; also good (and fast!) results for 100
                        ]
                    ]
                }
            ],
            temperature=0.0,
        )

        text_result = response.output_text
        #text_result = clean_markdown_block(text_result)
        cleaned_md, number_percent = extract_number_and_clean(text_result)

        if not is_valid_markdown(cleaned_md):
            cleaned_md = "```Something went wrong :( [model did not produce valid Markdown code]```"
        if not number_percent and number_percent != 0: #correctly sets to 0, when returned percentage is 0
            number_percent = 60
        if number_percent is not None and number_percent > 100:
            number_percent = 100
        if number_percent is not None and number_percent < 0:
            number_percent = 0

        print(cleaned_md, "\nPercentage: ", number_percent)
        print("Transcribed Audio: ", transcription.text)

        return cleaned_md, number_percent


#test_video = VideoChecker()
#test_video.check_fake_news("https://scontent-muc2-1.cdninstagram.com/o1/v/t16/f2/m86/AQNWaTdA78Ug5enthEKFs8veqUEMekOQRP-N7Py8i00R_s2y3vQft_StD0vwI7RCw3sei9g7a5OtIN128xN8SHLIwWWbc-1NCnC7Ico.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2xpcHMuYzIuNzIwLmJhc2VsaW5lIn0&_nc_cat=100&vs=672067241865076_1944884899&_nc_vs=HBksFQIYUmlnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC83NDRGQjE2RTVEMkRFNTc5NTNBRjVBMzY4QkU0RjY4MF92aWRlb19kYXNoaW5pdC5tcDQVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dPcFNKUjJ5SXdfNDZsMEVBQm9RbXdLdHJ3OV9icV9FQUFBRhUCAsgBACgAGAAbABUAACaEspuV3PLSPxUCKAJDMywXQCbdsi0OVgQYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HAA%3D%3D&ccb=9-4&oh=00_AfEL4YLCSTLWYvbCyJIxCtG6_HCrKfHQD7o2RN7iRRv4qA&oe=680E8F14&_nc_sid=d885a2")

#test_video.check_fake_news("https://scontent-fra3-1.cdninstagram.com/o1/v/t16/f2/m86/AQPk3oEeUPekgD9YQAGQHPv6BnBYRad_5GXOKuwaq2vVCvD_tEVoO0v4frmBQk3PDKFZn1ih19rfaqADx_g8Pzj94aHwbznj57yQ7VY.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2xpcHMuYzIuNzIwLmJhc2VsaW5lIn0&_nc_cat=105&vs=1006743031580223_23287292&_nc_vs=HBksFQIYUmlnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC9FMDQ1OEVFNUM0RjI2Q0M5MkI3RDc3QzE3QjlBNEZBRV92aWRlb19kYXNoaW5pdC5tcDQVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dPd3hTQjF1dDdKZXZTa0dBREJLSmMwYV9VcGhicV9FQUFBRhUCAsgBACgAGAAbABUAACaM4MewyK3NPxUCKAJDMywXQDwIcrAgxJwYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HAA%3D%3D&ccb=9-4&oh=00_AfGECnvWYlhvR4h7ybsP1T6n17Ph09ciWsSEYQW3Ph87AQ&oe=680EC9E3&_nc_sid=d885a2")

text_for_test = f"```1. **Fake News or Not:** (Yes/No)\n2. **Reasoning:** (Why or why not the content is fake news)\n3. **Supporting Evidence:** (Based on the visuals and transcription, list any clear evidence for your conclusion)\n4. **Sources:** (List any of the online sources you may have used)\n5. **Conclusion:** (State your conclusion here``` 0)"
#print(extract_number_and_clean(text_for_test))


