import selenium

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException
from time import sleep

# Start a new Chrome browser session
driver = webdriver.Chrome()

# Navigate to the website
driver.get("https://umd.libcal.com/admin/spaces/mediation?lid=6745#s-lc-tab-mediation")

try:
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
            elif (equipment.find("AR") != -1):
                print("AR Sandbox")
            elif (equipment.find("Laser") != -1):
                print("Laser Cutter")
            elif (equipment.find("Vinyl") != -1):
                print("Vinyl Cutter")
            else:
                print("Error")
            print(row_data, email)
            if (trained):
                driver.get(row_data[0])
            
                

    sleep(30)


finally:
    # Close the browser
    driver.quit()



# Old code before updating url
#   spaces_button = WebDriverWait(driver, 10).until(
#         EC.element_to_be_clickable((By.ID, "s-lc-app-menu-spaces"))
#     )
    
#     # Click the button
#     spaces_button.click()

#     dropdown = WebDriverWait(driver, 10).until(
#         EC.element_to_be_clickable((By.XPATH, "//*[@aria-owns[contains(., 'bs-select-1')]]"))
#     )

#     # Open the dropdown
#     dropdown.click()

#     stemlib_button = WebDriverWait(driver, 10).until(
#         EC.element_to_be_clickable((By.ID, "bs-select-1-3"))
#     )
    
#     # Click the button
#     stemlib_button.click()

#     mediation_tab = WebDriverWait(driver, 10).until(
#         EC.element_to_be_clickable((By.ID, "s-lc-tab-mediation"))
#     )
    
#     # Click the button
#     mediation_tab.click()


#     # Find the table element by its ID
#     #table = driver.find_element_by_id("medrtb")
#     table = WebDriverWait(driver, 10).until(
#         EC.element_to_be_clickable((By.ID, "medrtb"))
#     )

#     table = driver.find_element_by_id("medrtb")

#     # Iterate over each row in the table
#     for row in table.find_elements_by_tag_name("tr"):
#         # Extract data from each cell in the row
#         cells = row.find_elements_by_tag_name("th") + row.find_elements_by_tag_name("td")
#         row_data = [cell.text for cell in cells]
#         print(row_data)
