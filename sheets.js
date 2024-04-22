let accessToken = null;
let fetchData = [];
let mediatedTentativeData = [];

// Attempt to generate an API access token
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
    const token = data.access_token; // Store the token or pass to another function
    accessToken = token;
    console.log("Data from token:", data);
    return token;
  } catch (error) {
    console.error("Error:", error);
  }
}

// Attempt to fetch bookings
async function getBookings() {
  console.log("getBookings() called");

  if (accessToken === null) {
    console.error("Error: accessToken is null");
    return;
  }

  const payload = {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
    muteHttpExceptions: true
  };

  // Try fetching token
    // https://umd.libcal.com/1.1/events/bookings
    // lid: location id, gets us into the STEM Library
    // cid: category id, gets us the Makerspace equipment
    // could use eid instead if wanting to separate into each equipment
    // eid: 122599, 124146, 122587, 170482 (same order on booking page)

    // days: number of days into the future to get bookings
    // include_cancel: whether or not to include canceled -- prob doesn't matter
    // limit: how many bookings to return per page (max 500)
    // can add in page if ever 500 bookings (seems unlikely)

    // status: will be "Mediated Tentative" when not yet approved / denied

  try {
    const response = UrlFetchApp.fetch("https://umd.libcal.com/1.1/space/bookings?lid=6745&cid=31707&days=20&limit=500&include_cancel=0", payload);
    const data = JSON.parse(response.getContentText());
    fetchData = data;
    mediatedTentativeData = data.filter((obj) => obj.status == 'Mediated Tentative');
    //console.log("Data from bookings:", data);
    console.log("Here are the students with status: Mediated Tentative");
    console.log(mediatedTentativeData);
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
}

// Checks if the emails in mediatedTentativeData exist spreadsheet
function checkEmailsInSpreadsheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet(); // Gets the active sheet
  const emailsInSheet = sheet.getRange('C:C').getValues(); // Gets all values in column C
  const flatEmailList = emailsInSheet.flat(); // Flatten the array for easier searching

  mediatedTentativeData.forEach((obj) => {
    if (obj.email) { // Check if the email property exists
      if (flatEmailList.includes(obj.email)) {
        console.log(`Email found: ${obj.email}`);
      } else {
        console.log(`Email not found: ${obj.email}`);
      }
    }
  });
}

async function main() {
  await generateToken();
  await getBookings();
  checkEmailsInSpreadsheet(); // Now check the emails after fetching bookings
}

