import selenium
import asyncio

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import StaleElementReferenceException
from time import sleep
from quickstart import prep_emails
from quickstart import check_training

async def main():
    # Get all of the emails from the Google spreadsheet before moving on
    await prep_emails()

    # Start a new Chrome browser session
    driver = webdriver.Chrome()

    # Navigate to the website
    driver.get("https://umd.libcal.com/admin/spaces/mediation?lid=6745#s-lc-tab-mediation")

    try:  
        # Wait for the username and password fields to be present, then input credentials
        username_field = WebDriverWait(driver, 10).until(
         EC.presence_of_element_located((By.ID, "s-libapps-email"))
        )
        password_field = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "s-libapps-password"))
        )
        username_field.send_keys("lib-makerspace@umd.edu")
        password_field.send_keys("JohnAndStella1!")
    
        # Wait for the button to be clickable, then click button
        submit_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "s-libapps-login-button"))
        )
        submit_button.click()

        # Now on mediation tab
        # Wait for the table to be present and find the table element by its ID
        table = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "medrtb"))
        )
        table = driver.find_element(By.ID, "medrtb")

        # Go through each of the bookings in the table and process the row
        for row in reversed(table.find_elements(By.TAG_NAME, "tr")):
            try:
                await process_row(row, driver)
            except StaleElementReferenceException:
                print("stale element exception handled")
                 
        sleep(30)

    finally:
        # Close the browser
        driver.quit()



# Processes the booking in the row
async def process_row(row, driver):
    # Extract data from each cell in the row
    cells = row.find_elements(By.TAG_NAME, "td")
    row_data = []
    for cell in cells:
        try:
            row_data = row_data + [cell.find_element(By.TAG_NAME, "a").get_attribute("href")]
        except NoSuchElementException:
            print("no such element exception handled")

    # if a link was found in the row data, follow it after checking email
    if len(row_data): 
        # get the first part of the person's email (split whole email off first, then @)
        email = cells.pop(2).text.partition("\n")[2].partition("@")[0] + "@"
        equipment = cells.pop(0).text
        # determine equipment booking type
        # then find rows in google spreadsheet and see if the equipment is in the row properly
        trained = 0
        if "3d" in equipment.lower():
            print("3D Printer")
            trained = await check_training(email, "3d")
        elif "ar" in equipment.lower():
            print("AR Sandbox")
            trained = await check_training(email, "ar")
        elif "laser" in equipment.lower():
            print("Laser Cutter")
            trained = await check_training(email, "laser")
        elif "vinyl" in equipment.lower():
            print("Vinyl Cutter")
            trained = await check_training(email, "vinyl")
        else:
            print("Error")
        
        if (trained):
            driver.get(row_data[0])

            # Now in tab to approve the booking
            # Wait for the text area to appear and then add a note to say automatically done
            text_area = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.ID, "internal_note"))
            )
            text_area.send_keys("Automatically approved booking")

            # Wait for the approval button to be clickable, then click the button
            approve_button = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.ID, "appb"))
            )
            approve_button.click()
        
        else:
            print("not trained")

asyncio.run(main())