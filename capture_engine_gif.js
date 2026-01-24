const puppeteer = require("puppeteer");
const GIFEncoder = require("gifencoder");
const { createCanvas, Image } = require("canvas");
const fs = require("fs");

const OUTPUT_FILE = "cubepay_engine_rotating.gif";
const FRAMES = 60;
const DELAY = 50; // 50ms = ~20fps
const WIDTH = 800;
const HEIGHT = 800;

async function captureEngineGIF() {
  console.log("🎬 Starting CubePay Engine GIF capture...");

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log("🌐 Loading cube demo page...");
    await page.goto("http://localhost:5174/cube-demo", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Click the "Launch Payment System" button
    console.log("🎯 Opening payment cube...");
    await page.click('button:has-text("Launch Payment System")');
    await page.waitForTimeout(2000);

    // Initialize GIF encoder
    console.log("📸 Setting up GIF encoder...");
    const encoder = new GIFEncoder(WIDTH, HEIGHT);
    const stream = fs.createWriteStream(OUTPUT_FILE);

    encoder.createReadStream().pipe(stream);
    encoder.start();
    encoder.setRepeat(0); // Loop forever
    encoder.setDelay(DELAY);
    encoder.setQuality(10);

    console.log("📸 Capturing frames...");

    // Capture frames
    for (let i = 0; i < FRAMES; i++) {
      // Take screenshot
      const screenshot = await page.screenshot({
        type: "png",
        clip: {
          x: (1920 - WIDTH) / 2,
          y: (1080 - HEIGHT) / 2,
          width: WIDTH,
          height: HEIGHT,
        },
      });

      // Convert to canvas and add to GIF
      const img = new Image();
      img.src = screenshot;

      const canvas = createCanvas(WIDTH, HEIGHT);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      encoder.addFrame(ctx);

      process.stdout.write(`\r📸 Frame ${i + 1}/${FRAMES}...`);

      // Wait for next frame
      await page.waitForTimeout(DELAY);
    }

    console.log("\n💾 Finalizing GIF...");
    encoder.finish();

    await browser.close();

    console.log(`✅ Successfully created ${OUTPUT_FILE}`);
    console.log(`📊 Frames: ${FRAMES}`);
    console.log(`⏱️  Delay: ${DELAY}ms`);
    console.log(`🔄 Duration: ${(FRAMES * DELAY) / 1000}s`);
  } catch (error) {
    console.error("❌ Error capturing GIF:", error);
    process.exit(1);
  }
}

captureEngineGIF();
