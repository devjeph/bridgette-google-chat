/**
 * @file Database.gs
 * @description Contains all functions for interacting withi the User Database Google Sheet.
 */

const { use } = require("react");

// --- Global Database Constants
const SCRIPT_PROPERTIES = PropertiesService.getScriptProperties();
const USER_DATABASE_SHEET_ID = SCRIPT_PROPERTIES.getProperty('USER_DATABASE_SHEET_ID');
const USER_SHEET_NAME = 'Users';

// Column indices (1-based) for the "Users" sheet
const COL = {
    USER_ID: 1,
    DISPLAY_NAME: 2,
    EMAIL: 3,
    SPREADSHEET_ID: 4,
    IS_ENABLED: 5,
    IS_ADMIN: 6,
    LAST_NOTIFIED: 7
};

/**
 * Gets the "Users" sheet object from the database spreadsheet.
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} The sheet object.
 */

function getUserSheet(){
    try {
        const ss = SpreadsheetApp.openById(USER_DATABASE_SHEET_ID);
        const sheet = ss.getSheetByName(USER_SHEET_NAME);
        if (!sheet) {
            throw new Error(`Sheet "${USER_SHEET_NAME}" not found in spreadsheet ID ${USER_DATABASE_SHEET_ID}`);
        }
        return sheet;
    } catch (error) {
        console.error('Error getting user sheet: ' + error.toString());
        return null;
    }
}

/**
 * Finds a user's row number by their Google Chat User ID.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet The "Users" sheet object.
 * @param {string} userId The Google Chat User ID to search for.
 * @returns {number} The row number of the user, or -1 if not found.
 */

function findUserRow(sheet, userId) {
    const userIds = sheet.getRange(2, COL.USER_ID, sheet.getLastRow() - 1, 1).getValues();
    for (let i = 0; i < userIds.length; i++) {
        if (userIds[i][0] === userId) {
            return i + 2;  // +2 because getRange is 1-based and we start from row 2
        }
    }
    return -1;
}

/**
 * Retrieves a user's data from data from the database. If the user does not exist, they are created.
 * @param {Object} user The user object from the Google Chat event.
 * @returns {Object|null} The user's data from the database.
 */

function getOrCreateUser(user) {
    const sheet = getUserSheet();
    if (!sheet) return null;

    const userRow = findUserRow(sheet, user.name);

    if (userRow !== -1 ){
        // User exists, get their data
        const userData = sheet.getRange(userRow, 1, 1, sheet.getLastColumn()).getValues()[0];
        return {
            row: userRow,
            userId: userData[COL.USER_ID - 1],
            displayName: userData[COL.DISPLAY_NAME - 1],
            email: userData[COL.EMAIL - 1],
            spreadsheetId: userData[COL.SPREADSHEET_ID - 1],
            isEnabled: userData[COL.IS_ENABLED - 1],
            isAdmin: userData[COL.IS_ADMIN - 1]
        };
    } else {
        // User does not exist, create a new entry
        const newUserRecord = [
            user.name, // GoogleChatUserId
            user.displayName, // UserDisplayName
            user.email, // UserEmail
            '', // AssignedSpreadsheetId
            false,  // IsEnabled (requires consent)
            false,  // isAdmin
            ''
        ];
        sheet.appendRow(newUserRecord);
        return {
            row: sheet.getLastRow(),
            userId: user.name,
            displayName: user.displayName,
            email: user.email,
            spreadsheetId: '',
            isEnabled: false,
            isAdmin: false
        };
    }
}

/**
 * Checks if a user is an administrator.
 * @param {string} userId The Google Chat User ID to check.
 * @returns {boolean} True if the user is an administrator, false otherwise.
 */

function isUserAdmin(userId) {
    const sheet = getUserSheet();
    if (!sheet) return false;

    const userRow = findUserRow(sheet, userId);
    if (userRow === -1) return false; // User not found

    const isAdmin = sheet.getRange(userRow, COL.IS_ADMIN).getValue();
    return isAdmin === true || isAdmin === 'TRUE'; // Handle boolean or string representation
}

/**
 * Updates a specific cell for a user.
 * @param {number} row The row number of the user.
 * @param {number} col The column index to update (1-based).
 * @param {*} value The new value to set.
 */

function updateUserCell(row, col, value) {
    const sheet = getUserSheet();
    if (!sheet) return;

    sheet.getRange(row, col).setValue(value);
}


/**
 * Gets all users who are enabled.
 * @returns {Array<Object>} An array of enabled user objects.
 */

function getAllEnabledUsers() {
    const sheet = getUserSheet();
    if (!sheet) return [];

    const data = sheet.getDataRange().getValues();
    const headers = data.shift(); // This will remove the header row

    const users = [];

    data.forEach((row, index) => {
        const isEnabled = row[COL.IS_ENABLED - 1];
        if (isEnabled === true) {
            users.push({
                row: index + 2,
                userId: row[COL.USER_ID - 1],
                displayName: row[COL.DISPLAY_NAME - 1],
                email: row[COL.EMAIL - 1],
                spreadsheetId: row[COL.SPREADSHEET_ID - 1]
            });
        }
    });
    return users;   
}