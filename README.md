# UMD STEM Library Makerspace Booking Automation

## Project Overview
This Python script automates the approval process for equipment bookings at the UMD STEM Library Makerspace. The Makerspace offers various equipment like 3D printers and vinyl cutters, which require prior training. Previously, staff manually checked a spreadsheet to verify training before approving bookings. This script automates the approval of bookings for trained users by checking their emails against a spreadsheet. Note: The denial of untrained users' bookings is still performed manually by the staff.

## Technologies Used
- **Python**: Main programming language
- **Selenium**: Used for automating web browser interaction with LibCal
- **Google Sheets API**: Fetches data from a spreadsheet containing trained users' emails

## Features
- **Automated Booking Approval**: Automatically approves bookings for users whose emails are verified as trained.

## Changing the Frequency of Script Execution
To change how often the script runs, adjust the scheduling line at the bottom of the script. 

For example, to have the script run every 10 minutes, modify the line to:
- schedule.every(10).minutes.do(run_async_main)

To run the script every 2 hours, change the line to:
- schedule.every(2).hours.do(run_async_main)
