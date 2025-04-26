import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
API_KEY = os.environ.get('OPENAI_KEY')

#TODO:change temperature for final release

class ImageChecker:
    def check_for_ai(self, image_url:str):
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
                            "image_url": image_url,
                        },
                    ],
                }
            ],
            temperature=0.0,
        )
        return response.output_text

    def check_for_fake_news(self, image_url:str, image_caption:str | None = "This image has no caption associated with it."):
        client = OpenAI(api_key=API_KEY)
        response = client.responses.create(
            model="gpt-4.1",
            input=[
                {
                    "role": "system",
                    "content": [
                        {
                            "type": "input_text",
                            "text": (
                                "You are a sophisticated AI that analyzes images from social media for fake news detection. Please pay attention to any text contained in the image and provide your analysis in the following following structure, wrapped within a Markdown format:\n\n"
                                "1. **Fake News or Not:** (Yes/No)\n"
                                "2. **Reasoning:** (Why or why not the content is fake news)\n"
                                "3. **Supporting Evidence:** (Based on the visuals and caption, list any clear evidence for your conclusion)\n"
                                "4. **Sources:** (List any of the online sources you may have used)\n"
                                "5. **Conclusion:** (State your conclusion here)"
                            )
                        }
                    ]
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "input_text",
                         "text": "You are an expert at detecting fake news and images. Using your expertise and publicly available knowledge, decide if the following image contains fake news. Explain how you came to your conclusion and share your sources."},
                        {
                            "type": "input_image",
                            "image_url": image_url,
                        },
                        {"type": "input_text",
                         "text": f"Additionally, you may use the caption of the image to make assumptions about the sincerity of the image. Here is the caption: {image_caption}"},
                    ],
                }
            ],
            temperature=0.0,
        )
        return response.output_text


#def encode_image_to_base64(image_path):
#    with open(image_path, "rb") as img_file:
#        encoded = base64.b64encode(img_file.read()).decode("utf-8")
#    return encoded
#image = encode_image_to_base64("360_F_571212905_TW2oYC90IzPOKYGEqNKi6Tko8iSbl0Ej.jpg")
icheck = ImageChecker()
#print(icheck.check_for_ai("https://scontent-muc2-1.cdninstagram.com/v/t51.2885-15/491462880_18081225868673114_1244726184351464140_n.webp?stp=dst-jpg_e35_s1080x1080_sh0.08_tt6&_nc_ht=scontent-muc2-1.cdninstagram.com&_nc_cat=102&_nc_oc=Q6cZ2QEV_bto-AqChcCZOizEQCej1xdUIv2ESctWl7WhRzT5s-wVrg2qQWV1r3SjF7lHf4g&_nc_ohc=owZNrZe5UKQQ7kNvwHMPTF9&_nc_gid=NRWP9eDTzCOXah_vbwOBSg&edm=ANTKIIoBAAAA&ccb=7-5&oh=00_AfFBcIFpKMhfigdV7EYN0kEqkYMikcSLUs-Qwzrf2TKWqg&oe=68129328&_nc_sid=d885a2"))
# print(icheck.check_for_fake_news("https://scontent-muc2-1.cdninstagram.com/v/t51.2885-15/491462880_18081225868673114_1244726184351464140_n.webp?stp=dst-jpg_e35_s1080x1080_sh0.08_tt6&_nc_ht=scontent-muc2-1.cdninstagram.com&_nc_cat=102&_nc_oc=Q6cZ2QEV_bto-AqChcCZOizEQCej1xdUIv2ESctWl7WhRzT5s-wVrg2qQWV1r3SjF7lHf4g&_nc_ohc=owZNrZe5UKQQ7kNvwHMPTF9&_nc_gid=NRWP9eDTzCOXah_vbwOBSg&edm=ANTKIIoBAAAA&ccb=7-5&oh=00_AfFBcIFpKMhfigdV7EYN0kEqkYMikcSLUs-Qwzrf2TKWqg&oe=68129328&_nc_sid=d885a2", "LIKE AND FOLLOW!"))