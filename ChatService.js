/**
 * @file ChatService.js
 * @description This file contains the ChatService class which handles chat-related operations.
 */

/**
 * Creates a simple text message JSON object.
 * @param {string} text - The text content of the message.
 * @return {Object} A JSON object representing the text message.
 */

function createTextMessage(text) {
    return {
        "text": text
    };
}

/**
 * Creates the interactive consent card.
 * @returns {Object} A JSON object representing the consent card.
 */

function createConsentCard() {
    return {
        "cardsV2": [
            {
                "cardId": "consentCard",
                "card": {
                    "header": {
                        "title": "Hello, I'm Bridgette!",
                        "subtitle": "The BPG Digital Assistant",
                    },
                    "sections": [
                        {
                            "widgets": [
                                {
                                    "textParagraph": {
                                        "text": "To allow me to enable my functionalities, you must first give me consent to access your timesheet data. Please click the button below to agree."
                                    }
                                },
                                {
                                    "buttonList": {
                                        "buttons": [
                                            {
                                                "text": "Give Consent",
                                                "onClick": {
                                                    "action": {
                                                        "function": "give_consent",
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    ]
                }
            }
        ]
    };
}

/**
 * Sends a direct message to a specific user.
 * 
 * @param {string} userId - The ID of the user to send the message to.
 * @param {string} messageObject - The message to send.
 */

function sendDirectMessage(userId, messageObject) {
    const spaceName = `spaces/${userId.split('/')[1]}`;
    const url = `https://chat.googleapis.com/v1/${spaceName}/messages`;

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ScriptApp.getOAuthToken()}`
        },
        payload: JSON.stringify(messageObject)
    };

    try {
        UrlFetchApp.fetch(url, options);
    } catch (error) {
        console.error(`Failed to send message to ${userId}: ${error.toString()}`);
    }
}