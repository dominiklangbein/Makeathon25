import openai
import panel as pn
import os
from dotenv import load_dotenv
from langchain_community.chat_models import ChatOpenAI
from langchain.schema import HumanMessage
from openai import api_key
from langchain.prompts import PromptTemplate

load_dotenv()
API_KEY = os.environ.get('OPENAI_KEY')

template1 = """
           You are a critical thinker and an expert on several topics. Use websites like Wikipedia to check, if the following block of text is factually correct. Give a detailed explanation of your thought process and include your used sources.
           Text: {question}
           """
TEXT_PROMPT = PromptTemplate(input_variables=["question"], template=template1)

class TextChecker:
    def __init__(self):
        self.api_key = API_KEY

        # Initialize the ChatOpenAI model (you can change the model name if needed)
        self.chat = ChatOpenAI(model_name="gpt-4.1", temperature=0.6, api_key=API_KEY)

    def check_text(self, text:str):
        response = self.chat.invoke(TEXT_PROMPT.format(question=text))
        return response.content


