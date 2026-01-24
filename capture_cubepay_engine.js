#!/usr/bin/env node
/**
 * Capture CubePaymentEngine component as animated GIF
 * Uses Puppeteer to record the actual 3D cube from the browser
 */

const puppeteer = require("puppeteer");
const GIFEncoder = require("gifencoder");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

const OUTPUT_FILE = "cubepay_engine_cube.gif";
const FRAMES = 60; // Number of frames to capture
const DELAY = 50; // Delay between frames in ms
const WIDTH = 800;
const HEIGHT = 800;

async function captureCubePayEngineGIF() {
  console.log("🎬 Starting CubePay Engine GIF capture...");

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT });

  // Navigate to cube demo page
  console.log("🌐 Loading cube demo page...");
  await page.goto("http://localhost:5174/cube-demo", {
    waitUntil: "networkidle0",
  });

  // Wait for cube to be rendered
  await page.waitForTimeout(2000);

  // Click to open the payment cube
  console.log("🎯 Opening payment cube...");
  await page.click('button:has-text("Launch Payment System")');
  await page.waitForTimeout(1000);

  // Initialize GIF encoder
  const encoder = new GIFEncoder(WIDTH, HEIGHT);
  const stream = fs.createWriteStream(OUTPUT_FILE);
  encoder.createReadStream().pipe(stream);

  encoder.start();
  encoder.setRepeat(0); // 0 = loop forever
  encoder.setDelay(DELAY);
  encoder.setQuality(10); // 10 = best quality

  console.log("📸 Capturing frames...");

  // Capture frames
  for (let i = 0; i < FRAMES; i++) {
    const screenshot = await page.screenshot({
      type: "png",
      clip: {
        x: WIDTH / 2 - 400,
        y: HEIGHT / 2 - 400,
        width: 800,
        height: 800,
      },
    });

    const img = await loadImage(screenshot);
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
  console.log(`📊 Total frames: ${FRAMES}`);
  console.log(`⏱️  Duration per frame: ${DELAY}ms`);
  console.log(`🔄 Total animation time: ${(FRAMES * DELAY) / 1000}s`);
}

captureCubePayEngineGIF().catch(console.error);
