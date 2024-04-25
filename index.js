let accessToken = null;
let mediatedTentativeBookins = [];
let allBookings;

async function main() {
  accessToken = await generateToken();

  allBookings = await getBookings(accessToken);
  //console.log(allBookings);

  // filter out the booking requests which aren't "Mediated Tentative"
  mediatedTentativeBookings = allBookings.filter((obj) => obj.status == 'Mediated Tentative');
  console.log("Here are the students with status: Mediated Tentative");
  console.log(mediatedTentativeBookings);

  //await confirmBooking(mediatedTentativeData[0], accessToken);
  await createPossibleBookings(mediatedTentativeBookings); // Now check the emails after fetching bookings
}

// Attempt to generate an API access token
/**
 * Attempt to generate token for to be used for API calls
 * 
 * @returns access token if successfully generated, undefined otherwise
 */
async function generateToken() {
  console.log("generateToken() called");

  // Payload for fetch request
  const payload = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    payload: JSON.stringify({
      client_id: "1494",
      client_secret: "5aea4983508270cca9d102a3880d02d0",
      grant_type: "client_credentials",
    }),
    muteHttpExceptions: true  // Helps in debugging by not throwing exceptions on HTTP errors
  };

  // Try fetching token
  try {
    const response = UrlFetchApp.fetch("https://umd.libcal.com/1.1/oauth/token", payload);
    const data = JSON.parse(response.getContentText());
    console.log("Data from token:", data);
    return data.access_token; // Store the token or pass to another function
  } catch (error) {
    console.error("Error:", error);
    return;
  }
}

// Attempt to fetch bookings
/**
 * Attempt to fetch bookings
 * 
 * @param accessToken - Access token to access API call
 * 
 * @return array containing booking objects, undefined if API call fails
 */
async function getBookings(accessToken) {
  console.log("getBookings() called");

  if (!accessToken) { // 
    console.error("Error: accessToken is null");
    return;
  }

  const payload = { // Create payload
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
    muteHttpExceptions: true
  };

  /** 
    * Try fetching token
    * https://umd.libcal.com/1.1/events/bookings
    * lid: location id, gets us into the STEM Library
    * cid: category id, gets us the Makerspace equipment
    * could use eid instead if wanting to separate into each equipment
    * eid: 122599, 124146, 122587, 170482 (same order on booking page)
    *
    * days: number of days into the future to get bookings
    * include_cancel: whether or not to include canceled -- prob doesn't matter
    * limit: how many bookings to return per page (max 500)
    * can add in page if ever 500 bookings (seems unlikely)
    *
    * status: will be "Mediated Tentative" when not yet approved / denied
    */

  try {
    const response = UrlFetchApp.fetch("https://umd.libcal.com/1.1/space/bookings?lid=6745&cid=31707&days=20&limit=500&include_cancel=0&formAnswers=1", payload);
    const data = JSON.parse(response.getContentText());

    return data;
  } catch (error) {
    console.error("Error:", error);
    return;
  }
}

// Checks if the emails in mediatedTentativeData exist spreadsheet
/**
 * Create bookings for requests if requester is trained in desired equipment
 * 
 * @param bookings - array of booking request objects to attempt to confirm bookings
 */
function createPossibleBookings(bookings) {
  console.log("createPossibleBookings() called");

  //idt these variables are used
  //const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet(); // Gets the active sheet
  //const emailsInSheet = sheet.getRange('C:C').getValues(); // Gets all values in column C

  bookings.forEach((obj) => {

    if (obj.email) { // Check if the email property exists

      // make an array of all the rows where obj.email is found
      // for each row where obj.email is found, cross check obj.eid with what they're trained on
      // if found, confirm booking and send them an email

      let matchingRows = findMatchingRows(obj.email.split('@')[0]);
      //console.log("Matching rows for ", obj.email.split('@')[0]);

      for (let i = 0; i < matchingRows.length; i++) {

        let row = matchingRows[i];
        console.log(`Row ${row} for ${obj.email}`);
        let trainedTech = getCellValue('G', row);

        let bookingMade = false;

        console.log(`${obj.email} eid: ${obj.eid}`);

        // Based off the obj.eid(the id of the desired equipment), check if student is trained in desired equipment
        switch (obj.eid) { // check what equipment student requested
          case 122599: // 3D Printers
            if (trainedTech.toLowerCase().includes('3d printer')) {
              console.log(`${obj.email} is approved for 3D Printers`);

              // Approve obj.email's booking 
              const confirmed = confirmBooking(obj);
              if (confirmed) bookingMade = true;
            } else {
              console.log(`${obj.email} is not approved for 3D Printers`);
            }
            break;

          case 124146: // AR Sandbox
            if (trainedTech.toLowerCase().includes('ar sandbox')) {
              console.log(`${obj.email} is approved for AR Sandbox`);

              // Approve obj.email's booking 
              const confirmed = confirmBooking(obj);
              if (confirmed) bookingMade = true;
            } else {
              console.log(`${obj.email} is not approved for AR Sandbox`);
            }
            break;

          case 122587: // Laser Cutter
            if (trainedTech.toLowerCase().includes('laser cutter')) {
              console.log(`${obj.email} is approved for Laser Cutter`);

              // Approve obj.email's booking 
              const confirmed = confirmBooking(obj);
              if (confirmed) bookingMade = true;
            } else {
              console.log(`${obj.email} is not approved for Laser Cutter`);
            }
            break;

          case 170482: // Vinyl Cutter
            if (trainedTech.toLowerCase().includes('vinyl cutter')) {
              console.log(`${obj.email} is approved for Vinyl Cutter`);

              // Approve obj.email's booking 
              const confirmed = confirmBooking(obj);
              if (confirmed) bookingMade = true;
            } else {
              console.log(`${obj.email} is not approved for Vinyl Cutter`);
            }
            break;

          default:
            console.error(`${obj.email} is not booked for known equipment.`)
          
        }

        if (bookingMade) break; // End loop to prevent possible double bookings
      }
      /**
       * matchingRows.forEach(row => {
        console.log(`Row ${row} for ${obj.email}`);
        let trainedTech = getCellValue('G', row);
        //console.log(`Trained tech: ${trainedTech}`);

        // check obj.eid 
        console.log(`${obj.email} eid: ${obj.eid}`);

        switch (obj.eid) { // check what equipment student requested

          case 122599: // 3D Printers
            if (trainedTech.toLowerCase().includes('3d printer')) {
              console.log(`${obj.email} is approved for 3D Printers`);

              // Approve obj.email's booking 
              confirmBooking(obj);
              break;
            }

            break;

          case 124146: // AR Sandbox
            if (trainedTech.toLowerCase().includes('ar sandbox')) {
              console.log(`${obj.email} is approved for AR Sandbox`);

              // Approve obj.email's booking 
              confirmBooking(obj);
              break;
            }

            break;

          case 122587: // Laser Cutter
            if (trainedTech.toLowerCase().includes('laser cutter')) {
              console.log(`${obj.email} is approved for Laser Cutter`);

              // Approve obj.email's booking 
              confirmBooking(obj);
              break;
            }

            break;

          case 170482: // Vinyl Cutter
            if (trainedTech.toLowerCase().includes('vinyl cutter')) {
              console.log(`${obj.email} is approved for Vinyl Cutter`);

              // Approve obj.email's booking 
              confirmBooking(obj);
              break;

            }


            break;

          default:
            console.error(`${obj.email} is not booked for known equipment.`)
          // code block
        }


      });
       */
    }
  });
}

// Find matching rows based off paramenter
/**
 * Finds rows belonging to email username
 * 
 * @param username - the username who's rows to search for
 * 
 * @returns array containing the row numbers belonging to email username
 */
function findMatchingRows(username) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet(); // Gets the active sheet
  const columnC = sheet.getRange('C:C').getValues(); // Get all values in column C
  let matchingRows = []; // Initialize an array to store matching row numbers

  // Loop through each cell in column C
  columnC.forEach((cell, index) => {
    if (cell[0].split('@')[0] === username) { // Check if the cell's text contains the desired username
      matchingRows.push(index + 1); // Add the row number to the array (+1 because array is 0-indexed but rows are 1-indexed)
    }
  });

  console.log(matchingRows); // Log the array of matching row numbers
  return matchingRows; // Return the array for further use
}

/**
 * Get the value of a cell in the active spreadsheet
 * 
 * @param columnLetter - The letter of the column containing desired cell
 * @param rowNum - The number of the row containing desired cell
 * 
 * @returns value of cell based on parameters
 */
function getCellValue(columnLetter, rowNum) {
  // Get the active sheet
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // Build the cell reference
  var cellRef = columnLetter + rowNum;

  // Get the value of the cell
  var cellValue = sheet.getRange(cellRef).getValue();

  // Log the value to the console
  console.log('The value in cell ' + cellRef + ' is: ' + cellValue);

  // Optionally return the value
  return cellValue;
}

/**
 * Attempt to confirm a booking request
 * 
 * @param obj - Object containing booking request data
 * @param accessToken - Access token to access API call
 * 
 * @returns true if booking request is confirmed, false otherwise
 */
async function confirmBooking(obj, accessToken) {
  console.log("confirmBooking() called");

  console.log(`from: ${obj.fromDate}`);
  console.log(`to: ${obj.toDate}`);

  // Check if accessToken is available
  if (!accessToken) {
    console.error("Access token is null or undefined.");
    return false;
  }

  var payload = {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: 'Bearer ' + accessToken
    },
    muteHttpExceptions: true, // To prevent script from stopping on HTTP errors
    payload: JSON.stringify({
      test: 1, // Turn this to 0 to actually book
      adminbooking: 1,
      start: obj.fromDate, //removeTimeZoneColon(obj.fromDate), //"2024-05-02T12:00:00-0400",
      fname: obj.firstName,
      lname: obj.lastName,
      email: obj.email,
      q16114: obj.q16114, // UID
      q17656: obj.q17656, // "Are you trained in equipment"
      //status: "Mediated Approved",
      bookings: [{
        id: obj.eid,
        // going to 9:30 works but going to 10:30 doesn't ???
        to: obj.toDate,//removeTimeZoneColon(obj.toDate), //"2024-05-02T13:00:00-0400"
      }],  //2024-04-23T09:30:00-0400
    })
  };

  console.log("Payload prepared:", payload.payload);

  try {
    bookingCancelled = await cancelBooking(obj.bookId, accessToken);

    if (bookingCancelled) { // Only book the request if cancelling the booking was successful

      let response = UrlFetchApp.fetch("https://umd.libcal.com/1.1/space/reserve", payload);

      console.log("Fetch executed, checking response...");

      // Checking the HTTP response code
      if (response.getResponseCode() !== 200) {
        console.error("HTTP error! Status: " + response.getResponseCode() + " " + response.getContentText());
        return false;
      } else {
        let data = JSON.parse(response.getContentText());
        console.log("Booking confirmed. Data:", data);
        return true;
      }

    }

  } catch (error) {
    console.error("Error:", error);
    return false;
  }
}

/**
 * Attempt to cancel a booking request
 * 
 * @param bookingId - ID of booking to cancel
 * @param accessToken - Access token to access API call
 * 
 * @returns true if booking request is successfully cancelled, false otherwise
 */
async function cancelBooking(bookingId, accessToken) {
  console.log("cancelBooking() called")
  if (!accessToken) {
    console.error("Access token is null or undefined.");
    return false;
  }

  const cancelBookingPayload = {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    muteHttpExceptions: true
  };

  try {
    let cancelResponse = UrlFetchApp.fetch(`https://umd.libcal.com/1.1/space/cancel/${bookingId}`, cancelBookingPayload);

    // If the response code is not 200, log the error
    if (cancelResponse.getResponseCode() !== 200) {
      console.error("Failed to cancel booking. Status: " + cancelResponse.getResponseCode() + " " + cancelResponse.getContentText());
      return false;
    } else {
      console.log("Booking cancelled successfully. Booking ID: " + bookingId);
      return true;
    }
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return false;
  }
}








