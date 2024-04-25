import selenium

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException
from time import sleep

from quickstart import prep_emails
from quickstart import check_training


# Start a new Chrome browser session
driver = webdriver.Chrome()

# Navigate to the website
driver.get("https://umd.libcal.com/admin/spaces/mediation?lid=6745#s-lc-tab-mediation")

try:
    prep_emails()
    # Wait for the username and password fields to be present
    username_field = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "s-libapps-email"))
    )
    password_field = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "s-libapps-password"))
    )

    # Input your login credentials
    username_field.send_keys("lib-makerspace@umd.edu")
    password_field.send_keys("JohnAndStella1!")
    
    # Wait for the button to be clickable
    submit_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "s-libapps-login-button"))
    )
    
    # Click the button
    submit_button.click()


    # now on mediation tab
    # Find the table element by its ID
    #table = driver.find_element_by_id("medrtb")
    table = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "medrtb"))
    )

    table = driver.find_element(By.ID, "medrtb")

    # Iterate over each row in the table
    for row in table.find_elements(By.TAG_NAME, "tr"):
        # Extract data from each cell in the row
        cells = row.find_elements(By.TAG_NAME, "td")
        row_data = []
        for cell in cells:
            try:
                row_data = row_data + [cell.find_element(By.TAG_NAME, "a").get_attribute("href")]
            except NoSuchElementException:
                print("handled")
        # if a link was found in the row data, follow it after checking email
        if (len(row_data)): 
            # get the first part of the person's email (split whole email off first, then @)
            email = cells.pop(2).text.partition("\n")[2].partition("@")[0] + "@"
            equipment = cells.pop(0).text
            # determine equipment booking type
            # then find rows in google spreadsheet and see if the equipment is in the row properly
            trained = 0
            if (equipment.find("3D") != -1):
                print("3D Printer")
                trained = check_training(email, "3d")
            elif (equipment.find("AR") != -1):
                print("AR Sandbox")
                trained = check_training(email, "ar")
            elif (equipment.find("Laser") != -1):
                print("Laser Cutter")
                trained = check_training(email, "laser")
            elif (equipment.find("Vinyl") != -1):
                print("Vinyl Cutter")
                trained = check_training(email, "vinyl")
            else:
                print("Error")
            print(row_data, email)
            if (trained):
                driver.get(row_data[0])

                # now in tab to approve the booking
                text_area = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.ID, "internal_note"))
                )

                text_area = driver.find_element(By.ID, "internal_note")
                text_area.send_keys("Automatically approved booking")

                # Wait for the button to be clickable
                approve_button = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.ID, "appb"))
                )
    
                # Click the button
                approve_button.click()
            else:
                print("not trained")
                 
    sleep(30)

finally:
    # Close the browser
    driver.quit()
