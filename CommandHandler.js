/**
 * @file CommandHandler.js
 * @description Contains all functions for handling commands from Google Chat.
 */

/**
 * Routes slash commands to the appropriate handler functions.
 * @param {Object} event The event object containing command information.
 * @returns {Object} A JSON response object.
 */

function handleSlashCommand(event) {
    const command = event.message.slashCommand.commandId;
    const user = event.user;

    // Ensuring user exists in our database befor proceeding
    getOrCreateUser(user);

    switch (command) {
        case '1':
            return handleCheckTimesheet(event);
        case '2':
            return handleRegisterTimesheet(event);
        case '3':
            return handleCheckAllTimesheets(event);
        default:
            return createTextMessage("Unknown command");
    }
}

/**
 * Handles the /registertimesheet command.
 * @param {Object} event The event object containing command information.
 * @returns {Object} A JSON response object.
 */

function handleRegisterTimesheet(event) {
    const args = event.message.argumentText.trim().split(' ');
    const spreadsheetId = args[0];

    if (!spreadsheetId) {
        return createTextMessage("Please provide a valid spreadsheet ID. Usage: `/registertimesheet <spreadsheetId>`");
    }

    const user = getOrCreateUser(event.user);
    if (user) {
        updateUserCell(user.row, COL.SPREADSHEET_ID, spreadsheetId);
        return createTextMessage("Timesheet registered successfully.");
    } else {
        return createTextMessage("Could not find your data. Please try again.");
    }
}

/**
 * Handles the /checktimesheet command.
 * @param {Object} event The event object containing command information.
 * @returns {Object} A JSON response object.
 */

function handleCheckTimesheet(event) {
    const user = getOrCreateUser(event.user);

    if (!user.isEnabled) {
        return createTextMessage("You must first provide consent before I can check your timesheet. Please re-add me to start the consent process.");

    }

    if (!user.spreadsheetId) {
        return createTextMessage("You have not registered a timesheet yet. Please use `/registertimesheet <spreadsheetId>` to register your timesheet.");
    }

    // For this example, we will just confirm it would check.
    const month = event.message.argumentText.trim() || "the current month";
    return createTextMessage(`Checking timesheet for ${user.name} for ${month}. (This is a placeholder response; actual checking logic not implemented.)`);
}

/**
 * Handles the /checkalltimesheets command for admin users.
 * @param {Object} event The event object containing command information.
 * @returns {Object} A JSON response object.
 */

function handleCheckAllTimesheets(event) {
    const userId = event.user.name;

    if (!isUserAdmin(userId)) {
        return createTextMessage("You do not have permission to use this command.");
    }

    const month = event.message.argumentText.trim();
    if (!month || !/^d{6}$/.test(month)) {
        return createTextMessage("Please provide a valid month in the format YYYYMM. Usage: `/checkalltimesheets <YYYYMM>`");
    }

    const enabledUsers = getEnabledUsers();
    if (enabledUsers.length === 0) {
        return createTextMessage("No users have registered timesheets.");
    }

    let checkedCount = 0;
    let incompleteCount = 0;

    enabledUsers.forEach(user => {
        if (!user.spreadsheetId) {
            // will DM the user if they have not registered a timesheet
            console.log(`User ${user.name} has not registered a timesheet.`);
            return; // continue to next user
        }

        // Placeholder for actual checking logic
        const isComplete = checkUserTimesheet(user.spreadsheetId, month);

        if (!isComplete) {
            incompleteCount++;
            const message = `Hi ${user.displayName}, your timesheet for ${month} is incomplete. Please check it.`;
            sendDirectMessage(user.userId, createTextMessage(message));
        }
        checkedCount++;
    });

    const summaryMessage = `Timesheet check for ${month} complete.\n` +
        `- Checked ${checkedCount} users.\n` +
        `- Sent reminders to ${incompleteCount} users with incomplete timesheets.`;
    return createTextMessage(summaryMessage);
}

/** 
 * Placeholder function to simulate checking a user's timesheet.
 * @param {string} spreadsheetId The ID of the user's timesheet spreadsheet.
 * @param {string} month The month to check in YYYYMM format.
 * @returns {boolean} Returns true if the timesheet is complete, false otherwise.
 */

function checkUserTimesheet(spreadsheetId, month) {


    console.log(`Simulating check for timesheet ${spreadsheetId} for month ${month}`);
    return Math.random() > 0.5; // Randomly simulating completion status
}