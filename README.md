This program was not made with just whatsapp in mind but right now it only exports that, you can analyze your whatsapp chats following these steps:

- Enter in a chat or group chat.
- Click options (3 vertical dots).
- Click more, then Export chat.

It doesn't matter if media is included as it gets exported in individual files, just take the .txt file it gives you and put it in utils/examples.

On the extractors/whatsapp-extractor.js file navigate to the extract method (l. 552) and see for yourself which extraction methods are available, currently these are:

- Extract user messages.
- Extract user message count.
- Extract users.
- Extract filtered messages.
- Extract message words.
- Extract most active days.
- Extract most active months.
- Extract most active hours.
- Extract compared words.
