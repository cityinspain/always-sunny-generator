
from PIL import Image, ImageDraw, ImageFont
import textwrap
import moviepy.editor as mpy
import os

W, H = (1280, 720)
MAX_W, MAX_H = 400, 400
MSG = """\"The Gang Simply Walks Into Mordor\""""

msg = "\n".join(textwrap.wrap(MSG, 30))

img = Image.new('RGB', (W, H), color=(0, 0, 0))
d = ImageDraw.Draw(img)
fnt = ImageFont.truetype("./Textile.ttf", 48)

w, h = d.textsize(msg, fnt)
bounding_box = [0, 0, W, H]
x1, y1, x2, y2 = bounding_box

x = (x2 - x1 - w)/2 + x1
y = (y2 - y1 - h)/2 + y1

d.multiline_text((x, y), msg,
                 font=fnt, fill=(255, 255, 255), align='center', spacing=20)

img.save("./temp_titlecard.jpg")

inputVideoClip = mpy.VideoFileClip("./input.mp4")

imgClip = mpy.ImageClip(
    "./temp_titlecard.jpg")
audio = mpy.AudioFileClip("./always-sunny-theme.mp3").set_duration(5)

imgClip = imgClip.set_duration(audio.duration)
imgClip = imgClip.set_audio(audio)

clips = [inputVideoClip, imgClip]
vid = mpy.concatenate(clips)
vid.write_videofile("meme.mp4", fps=60)

if os.path.exists("temp_titlecard.jpg"):
    os.remove("temp_titlecard.jpg")
