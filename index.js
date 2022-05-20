const ffmpeg = require("fluent-ffmpeg");
const path = require("node:path");
const fs = require("fs");
const { registerFont, createCanvas } = require("canvas");
const open = require("open");

registerFont("./res/Textile.ttf", { family: "Textile" });

const getInputFileDimensions = () => {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .addInput("./res/walk-into-mordor.mp4")
      .ffprobe((err, metadata) => {
        if (err) {
          reject(err);
        } else {
          const { width, height } = metadata.streams.find(
            (stream) => stream.width
          );

          resolve({ width, height });
        }
      });
  });
};

const generateTitlecardImage = async (text) => {
  const dimensions = await getInputFileDimensions();
  return new Promise((resolve, reject) => {
    const canvas = createCanvas(dimensions.width, dimensions.height);

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.font = "48px Textile";
    ctx.fillStyle = "#FFFFFF";
    const { width: textWidth } = ctx.measureText(text);
    console.log(textWidth);

    ctx.fillText(text, canvas.width / 2 - textWidth / 2, canvas.height / 2);
    const out = fs.createWriteStream(__dirname + "/_generated/titlecard.jpg");
    const stream = canvas.createJPEGStream();
    stream.pipe(out);
    out.on("finish", () => {
      resolve(__dirname + "/_generated/titlecard.jpg");
    });
  });
};

const createTheme = () => {
  const outputPath = "./_generated/theme.wav";

  return new Promise((resolve, reject) => {
    ffmpeg("./res/always-sunny-theme.wav")
      .setDuration(5)
      .saveToFile(outputPath)
      .on("end", () => {
        resolve(path.resolve(outputPath));
      });
  });
};

const createTitlecardClip = () => {
  const outputFilepath = "./_generated/titlecard.mkv";

  return new Promise((resolve, reject) => {
    ffmpeg()
      .addInput("./_generated/titlecard.jpg")
      .loop(1)
      .setDuration(5)
      .saveToFile("./_generated/test.mp4")
      .on("end", () => {
        ffmpeg()
          .addInput("./_generated/test.mp4")
          .addInput("./_generated/theme.wav")
          .saveToFile(outputFilepath)
          .on("end", () => {
            resolve(path.resolve(outputFilepath));
          })
          .on("error", (err) => {
            reject(err);
          });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
};

const convertToMkv = async () => {
  const outputFilepath = "./_generated/subject.mkv";
  return new Promise((resolve, reject) => {
    ffmpeg()
      .addInput("./res/walk-into-mordor.mp4")
      .saveToFile(outputFilepath)
      .on("end", () => {
        resolve(path.resolve(outputFilepath));
      })
      .on("error", (err) => {
        reject();
      });
  });
};

const combineClips = async () => {
  const outputFile = "./_generated/combined.mkv";

  return new Promise((resolve, reject) => {
    ffmpeg()
      .addInput("./_generated/subject.mkv")
      .mergeAdd("./_generated/titlecard.mkv")
      .mergeToFile(outputFile)
      //   .on("progress", (progress) => {
      //     console.log(`[ffmpeg] ${JSON.stringify(progress)}`);
      //   })
      .on("end", () => {
        resolve(outputFile);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
};

const convertToMp4 = async (filePath, destination) => {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .addInput(filePath)
      .saveToFile(destination)
      .on("end", () => {
        resolve(path.resolve(destination));
      })
      .on("error", (err) => {
        reject(err);
      });
  });
};

const generate = async () => {
  if (!fs.existsSync("./_generated")) {
    fs.mkdirSync("_generated");
  }
  const titlecardImageFilepath = await generateTitlecardImage(
    "The Gang Simply Walks Into Mordor"
  );
  console.log("generate theme");
  const themeAudioFilepath = await createTheme();
  console.log("create titlecard");
  const titlecardFilepath = await createTitlecardClip();
  console.log("convert input to mkv");
  const mkvConvertedFilepath = await convertToMkv();
  console.log("combine clips into one file");
  const combinedFilepath = await combineClips();
  console.log("convert output to mp4");
  const finalFilepath = await convertToMp4(combinedFilepath, "output.mp4");

  // for the future
  // open("http://localhost:3001", { app: "firefox" });
};

generate();
