import undetected_chromedriver as uc
import sys
import time

try:
    print("Testing undetected-chromedriver...")
    options = uc.ChromeOptions()
    options.add_argument(f"--user-data-dir=C:\\Users\\cyber\\AppData\\Local\\Programs\\Antigravity\\chrome_profile_notebooklm")
    driver = uc.Chrome(
        options=options,
        browser_executable_path=r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    )
    print("Success! Version:", driver.capabilities['browserVersion'])
    driver.quit()
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
