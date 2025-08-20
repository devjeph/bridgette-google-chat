/**
 * @file Code.gs
 * @description Main entry point for the Bridgette Chat bot. This file contains the primary
 * doPost(e) function that receives and routes all events from Google Chat.
 */

/**
 * The main entry point for the Bridgette Chat bot. This function is called by Google Chat
 * whenever an event (like a message, command, or card click) occurs.
 * 
 * @param {Object} e The event payload from Google Chat.
 * @returns {Object} A JSON object representing the bot's response.
 */
function doPost(e) 
{
  const event = JSON.parse(e.postData.contents);

  // Logging the incoming event for debugging purposes
  console.log(`Received Event: ${JSON.stringify(event, null, 2)}`);

  try 
  {
    switch(event.type)
    {
      case 'MESSAGE':
        // This handles slash comands
        if (event.message.slashCommand)
        {
          return handleSlashCommand(event);
        }
        return createTextMessage("I am under development but some commands are up!");
      
      case 'CARD_CLICKED':
        // This handles interactions with interactive cards (e.g., consent button)
        return onCardClick(event);

      case 'ADDED_TO_SPACE':
        // This handles when the bot is first added to a space or DM
        return onUserAddedToSpace(event);

      case 'REMOVED_FROM_SPACE':
        // Handle cleanup if necessary when the bot is removed
        console.log(`Bot removed from space: ${event.space.name}`);
        // No response
        return;

      default:
        return createTextMessage("I am still under development but some commands are up!");
    }
  }
  catch (error)
  {
    console.error(`Error in doPost: ${error.toString()} '\n' ${error.stack}`);
    return createTextMessage("An error occurred. Please try again later.");
  }
}