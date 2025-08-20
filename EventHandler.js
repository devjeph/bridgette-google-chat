/**
 * @file EventHandler.js
 * @description This module provides a simple event handling system.
 */

function onUserAddedToSpace(event) {
    // Create user profile as soons as they add the bot
    getOrCreateUser(event.user);

    return createConsentCard();
}

/**
 * Handles the CARD_CLICKED event. Specifically looks for the 'give_consent' action.
 * @param {Object} event - The event object containing the action and user information.
 * @returns {Object} - A JSON response object.
 */

function onCardClick(event) {
    const action = event.common.invokedFunction;

    if (action === 'give_consent') {
        const user = getOrCreateUser(event.user);

        if (user) {
            updateUserCell(user.row, COL.IS_ENABLED, true);

            const updatedMessage = {
                text: 'Thank you! Commands are now enabled. You can register your timesheet using `/registertimesheet <spreadsheet ID>` command',
            };

            return {
                "actionResponse": {
                    "type": "UPDATE_MESSAGE",
                    "cardsV2": [
                        {
                            "cardId": "consent_card",
                            "card": {
                                "sections": [
                                    {
                                        "widgets": [
                                            {
                                                "textParagraph": {
                                                    "text": updatedMessage.text
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    ]
                }
            };
        }
    }

    return createTextMessage("I am not sure what you mean by that. Please try again.");
}