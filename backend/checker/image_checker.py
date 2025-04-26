import os
from dotenv import load_dotenv
from openai import OpenAI
import re
import markdown

load_dotenv()
API_KEY = os.environ.get('OPENAI_KEY')

#TODO:change temperature for final release

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
                                "You are a sophisticated AI that analyzes images from social media for fake news detection. Please pay attention to any text contained in the image and provide your analysis in the following following structure, wrapped within a Markdown format (as shown below):\n\n"
                                f"```1. **Fake News or Not:** (Yes/No)\n2. **Reasoning:** (Why or why not the content is fake news)\n3. **Supporting Evidence:** (Based on the visuals and text, list any clear evidence for your conclusion)\n4. **Sources:** (List any of the online sources you may have used)\n5. **Conclusion:** (State your conclusion here)```"
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
                        {"type": "input_text",
                         "text": "You are an expert at detecting fake news and images. Using your expertise and publicly available knowledge, decide if the following image contains fake news."},
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

        text_result = response.output_text
        cleaned_md, number_percent = extract_number_and_clean(text_result)

        print("number before: ", number_percent)
        if not is_valid_markdown(cleaned_md):
            cleaned_md = "```Something went wrong :( [model did not produce valid Markdown code]```"
        if not number_percent and number_percent != 0: #correctly sets to 0, when returned percentage is 0
            number_percent = 60
        if number_percent is not None and number_percent > 100:
            number_percent = 100
        if number_percent is not None and number_percent < 0:
            number_percent = 0

        print(cleaned_md, "\nPercentage: ", number_percent)

        return cleaned_md, number_percent


#def encode_image_to_base64(image_path):
#    with open(image_path, "rb") as img_file:
#        encoded = base64.b64encode(img_file.read()).decode("utf-8")
#    return encoded
#image = encode_image_to_base64("360_F_571212905_TW2oYC90IzPOKYGEqNKi6Tko8iSbl0Ej.jpg")
icheck = ImageChecker()
print(icheck.check_for_fake_news("https://scontent-muc2-1.cdninstagram.com/v/t51.2885-15/491462880_18081225868673114_1244726184351464140_n.webp?stp=dst-jpg_e35_s1080x1080_sh0.08_tt6&_nc_ht=scontent-muc2-1.cdninstagram.com&_nc_cat=102&_nc_oc=Q6cZ2QEV_bto-AqChcCZOizEQCej1xdUIv2ESctWl7WhRzT5s-wVrg2qQWV1r3SjF7lHf4g&_nc_ohc=owZNrZe5UKQQ7kNvwHMPTF9&_nc_gid=NRWP9eDTzCOXah_vbwOBSg&edm=ANTKIIoBAAAA&ccb=7-5&oh=00_AfFBcIFpKMhfigdV7EYN0kEqkYMikcSLUs-Qwzrf2TKWqg&oe=68129328&_nc_sid=d885a2"))
#print(icheck.check_for_fake_news("https://scontent-muc2-1.cdninstagram.com/v/t51.2885-15/491462880_18081225868673114_1244726184351464140_n.webp?stp=dst-jpg_e35_s1080x1080_sh0.08_tt6&_nc_ht=scontent-muc2-1.cdninstagram.com&_nc_cat=102&_nc_oc=Q6cZ2QEV_bto-AqChcCZOizEQCej1xdUIv2ESctWl7WhRzT5s-wVrg2qQWV1r3SjF7lHf4g&_nc_ohc=owZNrZe5UKQQ7kNvwHMPTF9&_nc_gid=NRWP9eDTzCOXah_vbwOBSg&edm=ANTKIIoBAAAA&ccb=7-5&oh=00_AfFBcIFpKMhfigdV7EYN0kEqkYMikcSLUs-Qwzrf2TKWqg&oe=68129328&_nc_sid=d885a2", "LIKE AND FOLLOW!"))