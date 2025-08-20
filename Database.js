/**
 * @file Database.gs
 * @description Contains all functions for interacting withi the User Database Google Sheet.
 */

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



