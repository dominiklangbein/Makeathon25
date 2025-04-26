import base64
import sys

from backend import crawler
from backend.crawler import instagram_crawler as igc, instagram_crawler
from langchain.schema import HumanMessage, SystemMessage
from langchain.chat_models import ChatOpenAI
import openai
import panel as pn
import os
from dotenv import load_dotenv
from langchain_community.chat_models import ChatOpenAI
from langchain.schema import HumanMessage
from openai import api_key, OpenAI
from langchain.prompts import PromptTemplate

load_dotenv()
API_KEY = os.environ.get('OPENAI_KEY')

#TODO:change temperature for final release

class ImageChecker:
    def check_for_ai(self, encoded_image:base64):
        client = OpenAI(api_key=API_KEY)
        response = client.responses.create(
            model="gpt-4.1",
            input=[
                {
                    "role": "user",
                    "content": [
                        {"type": "input_text", "text": "You are an expert at detecting fake news and images. Using your expertise and publicly available knowledge, decide if the following image is AI generated. Explain how you came to your conclusion and share your sources."},
                        {
                            "type": "input_image",
                            "image_url": f"data:image/jpeg;base64,{encoded_image}",
                        },
                    ],
                }
            ],
            temperature=0.0,
        )
        return response.output_text

    def check_for_fake_news(self, encoded_image:base64):
        client = OpenAI(api_key=API_KEY)
        response = client.responses.create(
            model="gpt-4.1",
            input=[
                {
                    "role": "user",
                    "content": [
                        {"type": "input_text",
                         "text": "You are an expert at detecting fake news and images. Using your expertise and publicly available knowledge, decide if the following image contains fake news. Explain how you came to your conclusion and share your sources."},
                        {
                            "type": "input_image",
                            "image_url": f"data:image/jpeg;base64,{encoded_image}",
                        },
                    ],
                }
            ],
            temperature=0.0,
        )
        return response.output_text


def encode_image_to_base64(image_path):
    with open(image_path, "rb") as img_file:
        encoded = base64.b64encode(img_file.read()).decode("utf-8")
    return encoded
image = encode_image_to_base64("360_F_571212905_TW2oYC90IzPOKYGEqNKi6Tko8iSbl0Ej.jpg")
icheck = ImageChecker()
#print(icheck.check_for_ai(image))
#print(icheck.check_for_fake_news(image))