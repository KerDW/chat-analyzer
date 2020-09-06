
class Message {
    constructor(date, time, user, message, isMedia, isUserMessage) {
        this.date = date;
        this.time = time;
        this.user = user;
        this.message = message;
        this.isMedia = isMedia;
        this.isUserMessage = isUserMessage;
    }
}

module.exports = Message;