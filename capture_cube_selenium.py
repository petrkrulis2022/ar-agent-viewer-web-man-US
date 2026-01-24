#!/usr/bin/env python3
"""
Capture CubePaymentEngine as animated GIF using Selenium
Automatically opens browser, navigates to cube demo, and captures rotating cube
"""

import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from PIL import Image
import io

OUTPUT_FILE = 'cubepay_engine_rotating.gif'
FRAMES = 60  # Number of frames
DELAY = 50   # Milliseconds between frames
URL = 'http://localhost:5174/cube-demo'

def capture_cubepay_engine_gif():
    print('🎬 Starting CubePay Engine GIF capture with Selenium...')
    
    # Setup Chrome options
    chrome_options = Options()
    chrome_options.add_argument('--headless')  # Run in background
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--window-size=1920,1080')
    
    print('🌐 Starting browser...')
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        # Navigate to cube demo
        print(f'📍 Navigating to {URL}...')
        driver.get(URL)
        
        # Wait for page to load
        time.sleep(2)
        
        # Click "Launch Payment System" button
        print('🎯 Clicking "Launch Payment System" button...')
        try:
            button = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Launch Payment System')]"))
            )
            button.click()
        except Exception as e:
            print(f"❌ Could not find button, trying alternative method...")
            # Try finding any button
            buttons = driver.find_elements(By.TAG_NAME, 'button')
            for btn in buttons:
                if 'Launch' in btn.text or 'Payment' in btn.text:
                    btn.click()
                    break
        
        # Wait for cube to appear
        time.sleep(2)
        
        # Set window size for consistent screenshots
        driver.set_window_size(1920, 1080)
        
        print('📸 Capturing frames...')
        frames = []
        
        # Capture frames
        for i in range(FRAMES):
            # Take screenshot
            screenshot = driver.get_screenshot_as_png()
            img = Image.open(io.BytesIO(screenshot))
            
            # Crop to center 800x800 (where the cube is)
            width, height = img.size
            left = (width - 800) // 2
            top = (height - 800) // 2
            right = left + 800
            bottom = top + 800
            
            cropped = img.crop((left, top, right, bottom))
            frames.append(cropped)
            
            print(f'\r📸 Frame {i + 1}/{FRAMES}...', end='')
            
            # Wait for next frame
            time.sleep(DELAY / 1000.0)
        
        print('\n💾 Saving GIF...')
        
        # Save as GIF
        frames[0].save(
            OUTPUT_FILE,
            save_all=True,
            append_images=frames[1:],
            duration=DELAY,
            loop=0,
            optimize=True
        )
        
        print(f'✅ Successfully created {OUTPUT_FILE}')
        print(f'📊 Total frames: {FRAMES}')
        print(f'⏱️  Duration per frame: {DELAY}ms')
        print(f'🔄 Total animation time: {(FRAMES * DELAY) / 1000:.1f}s')
        
        # Get file size
        file_size = os.path.getsize(OUTPUT_FILE)
        print(f'📦 File size: {file_size / 1024:.1f} KB')
        
    except Exception as e:
        print(f'❌ Error: {e}')
        import traceback
        traceback.print_exc()
    
    finally:
        print('🔒 Closing browser...')
        driver.quit()

if __name__ == '__main__':
    # Check if required packages are installed
    try:
        from selenium import webdriver
        from PIL import Image
        print('✅ All required packages found!')
    except ImportError as e:
        print(f'❌ Missing package: {e}')
        print('\n📦 Please install required packages:')
        print('   pip install selenium pillow')
        print('\n🌐 Also make sure Chrome/Chromium is installed')
        print('   And chromedriver: https://chromedriver.chromium.org/')
        exit(1)
    
    capture_cubepay_engine_gif()
