# Google Sheets Integration Setup Guide

Follow these simple steps to link your **Abiaeye Crime Reporting System** directly to a Google Sheet. Once set up, all reported crimes (anonymous or registered) will be automatically written to your sheet, and tracking searches will check the Google Sheet in real-time.

---

## Step 1: Create your Google Sheet
1. Open [Google Sheets](https://sheets.google.com) and create a new blank spreadsheet.
2. You can name it whatever you like (e.g. `Abiaeye Crime Registry`).

---

## Step 2: Open Extensions & Paste the Script
1. In the top menu of your Google Sheet, click on **Extensions** > **Apps Script**.
2. Delete any default code in the editor (e.g., `function myFunction() { ... }`).
3. Copy the entire block of code below and paste it into the Apps Script editor:

```javascript
// Google Apps Script code for Abiaeye Crime Reporting System
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Parse parameters from JSON body or fallback to e.parameter
    var params = {};
    if (e.postData && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        params = e.parameter;
      }
    } else {
      params = e.parameter;
    }
    
    // Add header row if sheet is brand new and empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Reference Number", "Anonymous", "Crime Type", "Description", 
        "Location", "Date", "Time", "Reporter Name", "Reporter Phone", 
        "Reporter Email", "Reporter NIN", "Created At", "Status", "Assigned Officer"
      ]);
    }
    
    sheet.appendRow([
      params.reference_no || params.reference_number || "",
      params.anonymous !== undefined ? params.anonymous : "",
      params.crime_type || "",
      params.description || "",
      params.location || "",
      params.crime_date || params.date || "",
      params.crime_time || params.time || "",
      params.reporter_name || "",
      params.reporter_phone || "",
      params.reporter_email || "",
      params.reporter_nin || "",
      params.created_at || new Date().toISOString(),
      params.status || "Pending",
      params.assigned_officer || ""
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var ref = e.parameter.ref;
    
    if (!ref) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "No reference provided" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0].toString().toUpperCase() === ref.toString().toUpperCase()) {
        var report = {};
        for (var j = 0; j < headers.length; j++) {
          var key = headers[j].toLowerCase().replace(/ /g, "_");
          report[key] = data[i][j];
        }
        
        return ContentService.createTextOutput(JSON.stringify({ 
          status: "success", 
          report: {
            reference_no: report.reference_number,
            anonymous: Number(report.anonymous),
            crime_type: report.crime_type,
            description: report.description,
            location: report.location,
            crime_date: report.date,
            crime_time: report.time,
            reporter_name: report.reporter_name || null,
            reporter_phone: report.reporter_phone || null,
            reporter_email: report.reporter_email || null,
            reporter_nin: report.reporter_nin || null,
            created_at: report.created_at,
            status: report.status,
            assigned_officer: report.assigned_officer || null
          }
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "not_found" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Click the **Save** icon (floppy disk) at the top of the editor or press `Ctrl + S`.

---

## Step 3: Deploy the Script as a Web App
1. Click the **Deploy** button at the top right of the editor, then select **New deployment**.
2. Click the gear icon next to "Select type" and select **Web app**.
3. Configure the settings:
   - **Description**: `Abiaeye Webhook` (or leave blank).
   - **Execute as**: Select **Me (your-email@gmail.com)**.
   - **Who has access**: Select **Anyone** *(This is important so your website can send data to it without logging in to Google)*.
4. Click **Deploy**.
5. Google will ask you to authorize access. Click **Authorize access**, choose your account, click **Advanced** at the bottom, and then click **Go to Untitled project (unsafe)**. Finally, click **Allow**.
6. Once deployed, you will see a **Web app** section containing a URL. Copy this **URL** (it will look like `https://script.google.com/macros/s/XXXXX/exec`).

---

## Step 4: Add the URL to your project code
1. Open the [js/main.js](file:///c:/Users/hp/Desktop/anya/Abiaeye/js/main.js) file.
2. Locate the variable at the top of the file:
   ```javascript
   const GOOGLE_SHEET_WEBHOOK_URL = '';
   ```
3. Paste your copied URL between the quotes:
   ```javascript
   const GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/XXXXX/exec';
   ```
4. Save the file.

Now, whenever you submit a report, it will instantly show up in your Google Sheet, and the Case Status tracking page will query your Google Sheet database!
