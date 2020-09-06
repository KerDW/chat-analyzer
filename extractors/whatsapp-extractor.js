const ExtractorClass = require('../classes/extractor-class');
const Message = require('../classes/message-class');
const DEFAULT_USER = 'System';
const DEFAULT_LINE_SPLITTER = '\-\-\-\-SPLITTER\¬\&'; // Random message to use as line splitter

class WhatsappConversation {
    constructor() {
        this.users = null;
        this.messages = null;        
    }
}

/**
 * Whatsapp Extractor
 */
class WhatsappExtractor extends ExtractorClass {
    constructor(src) {
        super(src);
    }

    // onlyMedia null -> both messages and media; onlyMedia false -> only messages; onlyMedia true -> only media; (all ordered accordingly)
    // the onlyMedia parameter complicates the code a bit and it's not that useful since you get all the information already by setting it null, the only advantage is the sorting
    _extractUsersMessagesCount(messages, onlyMedia = null) {
        var users = [];

        // add an array entry for all user messages
        const allUsers = onlyMedia === null ? {allusers: true, totalMessages: 0, textMessages: 0, media: 0} : onlyMedia === false ? {allusers: true, textMessages: 1} : {allusers: true, media: 1}

        users.push(allUsers)

        // iterates through the messages, finds the user if it exists and adds a count variable to its object according to the specified requirements 
        messages.map(m => { 

            // if it's an user message and meets the media requirements specified
            if(m.isUserMessage && (onlyMedia !== false || !m.isMedia)){

                // adds count according to the specified requirements to the user through the index specified
                function countMessages(index){
                    if(onlyMedia === null){
                        users[index].totalMessages++
                    }
                    if(!onlyMedia && !m.isMedia){
                        users[index].textMessages++
                    }
                    if(onlyMedia !== false && m.isMedia){
                        users[index].media++
                    }
                }

                // tries to find the user through the index, if it doesn't it returns -1
                var user_index = users.findIndex(u => u.user == m.user)

                // creates a new user object with the initial count if it doesn't exist already in the array, otherwise just adds to the count
                if(user_index == -1){
                    const user = onlyMedia === null ? {user: m.user, totalMessages: 1, textMessages: !m.isMedia ? 1 : 0, media: m.isMedia ? 1 : 0} : onlyMedia === false ? {user: m.user, textMessages: 1} : {user: m.user, media: 1}
                    users.push(user)
                } else {
                    countMessages(user_index)
                }

                countMessages(0)

            }

        });

        // sorts by media, messages or totalMessages depending on the specified requests
        if(onlyMedia) {
            users = users.sort((a, b) => { return b.media - a.media; })
        } else if (onlyMedia == false) {
            users = users.sort((a, b) => { return b.textMessages - a.textMessages; })
        } else {
            users = users.sort((a, b) => { return b.totalMessages - a.totalMessages; })
        }

        return users;
    }

    // extract the message count for every day of the week for the specified set of messages
    _extractMostActiveDays(messages){
        var mostActiveDays = []

        // this allows an easier day mapping
        var weekDay = new Array(7);
        weekDay[0] = "Sunday";
        weekDay[1] = "Monday";
        weekDay[2] = "Tuesday";
        weekDay[3] = "Wednesday";
        weekDay[4] = "Thursday";
        weekDay[5] = "Friday";
        weekDay[6] = "Saturday";

        // array entry for all users
        mostActiveDays.push({all_users: true, total: 0})

        messages.map(m => { 

            if(m.isUserMessage){
                // create a Date object with the message information, this could be done in the message class and be done with it
                var parts = m.date.split('/')
                var year = parseInt(parts[2], 10) + 2000
                var month = parseInt(parts[0], 10) - 1 // month is zero-based
                var day = parseInt(parts[1], 10)
                var messageDate = new Date(year, month, day);

                // check if the object has this day's attribute and add to the count or create it if it doesn't
                function countDaysMessages(index){
                    if(mostActiveDays[index].hasOwnProperty([weekDay[messageDate.getDay()]])){
                        mostActiveDays[index][weekDay[messageDate.getDay()]]++
                    } else {
                        mostActiveDays[index][weekDay[messageDate.getDay()]] = 1
                    }
                    mostActiveDays[index].total++
                }

                countDaysMessages(0)

                // tries to find the user through the index, if it doesn't it returns -1
                var user_index = mostActiveDays.findIndex(u => u.user == m.user)

                // creates a new user object with the initial count if it doesn't exist already in the array, otherwise just adds to the count
                if(user_index == -1){
                    const userDays = {user: m.user, total: 1, [weekDay[messageDate.getDay()]]: 1}
                    mostActiveDays.push(userDays)
                } else {
                    countDaysMessages(user_index)
                }

            }

        });

        mostActiveDays = mostActiveDays.sort((a, b) => {
            return b.total - a.total;
        })

        return mostActiveDays;
    }

    // extract the message count for every month for the specified set of messages
    _extractMostActiveMonths(messages){
        var mostActiveMonths = []

        // month mapping
        var months = new Array(11);
        months[0] = "January";
        months[1] = "February";
        months[2] = "March";
        months[3] = "April";
        months[4] = "May";
        months[5] = "June";
        months[6] = "July";
        months[7] = "August";
        months[8] = "September";
        months[9] = "October";
        months[10] = "November";
        months[11] = "December";

        // all users
        mostActiveMonths.push({all_users: true, all_months_total: 0})

        messages.map(m => { 

            if(m.isUserMessage){
                var parts = m.date.split('/')
                var month = parseInt(parts[0], 10) - 1 // month is zero-based

                // check if the object on the specified index contains the month the message is from, if it doesn't then it creates it with 
                // the attributes total_month, textMessages and media, if it does then it just adds to the count it belongs
                function countMessages(index){
                    if(mostActiveMonths[index].hasOwnProperty(months[month])){

                        if(!m.isMedia){
                            if(mostActiveMonths[index][months[month]].hasOwnProperty('textMessages')){
                                mostActiveMonths[index][months[month]].textMessages++
                            } else {
                                mostActiveMonths[index][months[month]].textMessages = 1
                            }
                        }

                        if(m.isMedia){
                            if(mostActiveMonths[index][months[month]].hasOwnProperty('media')){
                                mostActiveMonths[index][months[month]].media++
                            } else {
                                mostActiveMonths[index][months[month]].media = 1
                            }
                        }

                        mostActiveMonths[index][months[month]].total_month++

                    } else {
                        mostActiveMonths[index][months[month]] = {total_month: 1, textMessages: m.isMedia ? 0 : 1, media: m.isMedia ? 1 : 0}
                    }
                    mostActiveMonths[index].all_months_total++
                }

                countMessages(0);

                // tries to find the user through the index, if it doesn't it returns -1
                var user_index = mostActiveMonths.findIndex(u => u.user == m.user)

                // creates a new user object with the initial count if it doesn't exist already in the array, otherwise just adds to the count
                if(user_index == -1){
                    const userMonths = {user: m.user, all_months_total: 1, [months[month]]: {total_month: 1, textMessages: m.isMedia ? 0 : 1, media: m.isMedia ? 1 : 0}}
                    mostActiveMonths.push(userMonths)
                } else {
                    countMessages(user_index);
                }

            }

        });

        mostActiveMonths = mostActiveMonths.sort((a, b) => {
            return b.all_months_total - a.all_months_total;
        })

        return mostActiveMonths;
    }

    // 24h format
    // get the most active hours from all users and individually with an optional day filter to get the hours just for that specific day of the week
    _extractMostActiveHours(messages, dayFilter = null){
        var mostActiveHours = []

        // mapping if needed
        if(dayFilter){

            var weekDay = new Array(7);
            weekDay[0] = "Sunday";
            weekDay[1] = "Monday";
            weekDay[2] = "Tuesday";
            weekDay[3] = "Wednesday";
            weekDay[4] = "Thursday";
            weekDay[5] = "Friday";
            weekDay[6] = "Saturday";

        }

        // all users object
        mostActiveHours.push({all_users: true, total: 0})

        messages.map(m => { 

            if(m.isUserMessage){

                // Date object if needed
                if(dayFilter){

                    var parts = m.date.split('/')
                    var year = parseInt(parts[2], 10) + 2000
                    var month = parseInt(parts[0], 10) - 1 // month is zero-based
                    var day = parseInt(parts[1], 10)
                    var messageDate = new Date(year, month, day);

                }

                // if there's no day filter or the filter matches the message's day
                if(!dayFilter || [weekDay[messageDate.getDay()]] == dayFilter){

                    var hour = m.time.substr(0, m.time.indexOf(':'));

                    // checks for the hour attribute in the specified index, creates it if it doesn't exist, adds to the count if it does
                    function countHours(index){
                        if(mostActiveHours[index].hasOwnProperty([hour])){
                            mostActiveHours[index][hour]++
                        } else {
                            mostActiveHours[index][hour] = 1
                        }
                        mostActiveHours[index].total++
                    }

                    countHours(0)

                    // tries to find the user through the index, if it doesn't it returns -1
                    var user_index = mostActiveHours.findIndex(u => u.user == m.user)

                    // creates a new user object with the initial count if it doesn't exist already in the array, otherwise just adds to the count
                    if(user_index == -1){
                        const userDays = {user: m.user, total: 1, [hour]: 1}
                        mostActiveHours.push(userDays)
                    } else {
                        countHours(user_index)
                    }

                }

            }

        });

        mostActiveHours = mostActiveHours.sort((a, b) => {
            return b.total - a.total;
        })

        return mostActiveHours;
    }

    // this function is not that useful for WhatsApp since most of this can be done through the app
    // filters the specified set of messages, you can filter by words, whether it is media or not, user, date and time
    // if strict filter is true (default) then it will try to find that word exactly, e.g. mass will only find the word 'mass' and won't match 'massage', which a loose filter would
    // date can be passed as a single date or as an array with two dates, which will search for messages between these dates
    _extractFilteredMessages(messages, filter = null, media = null, user = null, date = null, time = null, strictFilter = true) {
        const filteredMessages = [];

        // iterates through the messages, if any specified condition is not met the message will skip the other checks and won't be pushed into the array
        messages.map(m => {

            var pushMessage = true;

            if(media != null && pushMessage){
                if(media && !m.isMedia){
                    pushMessage = false;
                } else if(!media && m.isMedia) {
                    pushMessage = false;
                }
            }

            if(user && m.user != user && pushMessage){
                pushMessage = false;
            }

            if(time && m.time != time && pushMessage){
                pushMessage = false;
            }

            // check if the date parameter passed is an array, if it is then checks for a date between these, both included
            // else it just tries to match the date
            if(date && pushMessage){
                // the between part needs work, fails sometimes
                if(date.constructor === Array){
                    var message_date = Date.parse(m.date)
                    var date_start = Date.parse(date[0])
                    var date_end = Date.parse(date[1])
                    
                    if(message_date >= date_end || message_date <= date_start){
                        pushMessage = false;
                    }
                } else {
                    if(Date.parse(date) !== Date.parse(m.date)){
                        pushMessage = false;
                    }
                }
                
            }

            // strict filter matches the word, loose filter is just an includes()
            if(filter && pushMessage) {
                if(strictFilter){
                    var found = false;

                    m.message.split(" ").forEach(e => {
                        
                        if(e.toLowerCase() == filter.toLowerCase()){
                            found = true;
                        }
                        
                    });
                    if(!found){
                        pushMessage = false;
                    }
                } else {
                    if(!m.message.toLowerCase().includes(filter.toLowerCase())){
                        pushMessage = false;
                    }
                }
            }

            if(pushMessage){
                filteredMessages.push(m)
            }

        });

        return filteredMessages;
    }

    // extracts the users 
    _extractUsers(userMessagesCount) {
        var users = [];
        users = userMessagesCount.map(m => {return m.user});
        return users;
    }

    // parses the messages from the chat or set of messages into lines and creates Message objects
    _extractMessages(data) {
        // split the set of messages into lines, each representing a user or system message 
        let lines = data.replace(/\d{1,2}\/\d{1,2}\/\d{1,2},\s\d{1,2}:\d{1,2}\s-\s/g, `${DEFAULT_LINE_SPLITTER}$&`);
        lines = lines.split(new RegExp(DEFAULT_LINE_SPLITTER, 'g')).filter(m => m).map(m => m.replace(/\n$/, ''));

        const messages = [];

        // for each line parses the information as best as possible, creates an object Message and adds it to the messages array
        for (let line of lines) {
            let lastIndex = 0;
            let index = line.match(/,/).index;

            const date = line.slice(lastIndex,index).trim();
            lastIndex = index+1;
            index = line.match(/-/).index;

            const time = line.slice(lastIndex,index).trim();
            lastIndex = index+1;

            line = line.replace(/:/,'$');

            let user = DEFAULT_USER;
            // tries to get the message's text
            const match = line.match(/:/); // Fails if a system message contains ':', e.g. 5/7/17, 22:41 - Alvaro created group "Grupo: de salir (official)"
            if (match) {
                user = line.slice(lastIndex, match.index).trim();
                lastIndex = match.index+1;
            }

            const message = line.slice(lastIndex).trim();

            const isMedia = message == "<Media omitted>";
            const isUserMessage = user != "System";

            messages.push(new Message(date, time, user, message, isMedia, isUserMessage));
        }

        return messages;
    }

    // extract the words from the set of messages specified, can be filtered by words and length (0 by default), the filter is also strict by default
    _extractMessagesWords(messages, filter = null, minimumWordLength = 0, strictFilter = true){
        var messagesWords = []
        var progress = 1

        messages.map((m, index) => {

            // certainly improvable progress bar
            if(Math.ceil(messages.length / 100) * progress == index){
                progress++
                process.stdout.clearLine();
                process.stdout.cursorTo(0);
                process.stdout.write(progress + '%');
            }

            // no need to parse media or system messages
            if(!m.isMedia && m.isUserMessage){
                m.message.split(" ").forEach(e => {

                    var messageWord = e.toLowerCase();
                    var matchesRequirement = !filter ? true : strictFilter ? messageWord == filter : messageWord.includes(filter);

                    // parses the message if there's no filter or the message matches it and the message also meets the length
                    if((!filter || matchesRequirement) && (messageWord.length >= minimumWordLength)){

                        var newWord = true;
                                
                        // if the word exists in the array we're going to return, just add to the count
                        messagesWords.map(function(words_item){
                            var word = words_item.word.toLowerCase()
                            if(word == messageWord){

                                newWord = false;
                                words_item.total_count++

                                if(words_item.hasOwnProperty([m.user])){
                                    words_item[m.user]++
                                } else {
                                    words_item[m.user] = 1
                                }

                            }
                        })
                        
                        // else create the object and push it into the array
                        if(newWord){
                            messagesWords.push({word: messageWord, total_count: 1, [m.user]: 1})
                        }
                    }
                    
                });
            }
        })

        // remove the progress bar
        process.stdout.clearLine();

        messagesWords = messagesWords.sort((a, b) => {
            return b.total_count - a.total_count;
        })

        return messagesWords;
    }

    // the main idea behind this method is to compare the word usage and occurrence in one person and check the others in the conversation
    // and then display in a percentage the similarity between the person being compared and the rest of the conversation members
    // probably needs improvement or a better idea, I don't see any use for this
    // should also take into account the amount of messages the compared users have sent, messages disparity will make this very unreliable
    _compareWords(words, personToCompare){

        var peopleWithAffinity = []
        var peopleWithAffinityPercentages = []
        var personToCompareWords = 0

        words.map(w => {

            if(w.hasOwnProperty([personToCompare])){

                personToCompareWords++

                // remove unnecessary (for now) properties
                delete w.word 
                delete w.total_count
                
                for (let [person, occurrences] of Object.entries(w)){

                    if(person != personToCompare){

                        // if the words occurrences from this person are closer to the word occurrences to the person 
                        // that it is comparing to than to zero it will add an "affinity" counter
                        var personToCompareWordOcurrences = w[personToCompare]
                        var differenceToCompared = Math.abs(occurrences - personToCompareWordOcurrences)

                        if(differenceToCompared < occurrences){

                            var personIndex = peopleWithAffinity.findIndex(item => item.person == person)

                            if(personIndex == -1){
                                peopleWithAffinity.push({person: person, occurrences: 1})
                            } else {
                                peopleWithAffinity[personIndex].occurrences++
                            }

                        }

                    }

                }

            }

        })

        // calculate the affinity percentage based on the counters each person has
        peopleWithAffinity.map(p => {

            var affinity = p.occurrences * 100 / personToCompareWords

            peopleWithAffinityPercentages.push({person: p.person, affinity: affinity + '%'})

        })

        return peopleWithAffinityPercentages;

    }

    extract() {
        // node main.js --file=./utils/examples/example-conversation.txt

        const data = this.loadData();
        const messages = this._extractMessages(data);
        const usersMessagesCount = this._extractUsersMessagesCount(messages, null);
        const users = this._extractUsers(usersMessagesCount);
        const filteredMessages = this._extractFilteredMessages(messages, "palo", null, null, [4/8/20, 4/8/20], null, true);
        const messagesWords = this._extractMessagesWords(messages, "palo", 0, true);
        const mostActiveDays = this._extractMostActiveDays(messages);
        const mostActiveMonths = this._extractMostActiveMonths(messages);
        const mostActiveHours = this._extractMostActiveHours(messages);
        const comparedWords = this._compareWords(messagesWords, 'Ricky G')
        console.log(messages);
        console.log(usersMessagesCount);
        // console.log(users);
        // console.log(filteredMessages);
        // console.log(messagesWords)
        // console.log(mostActiveDays)
        // console.log(mostActiveMonths)
        // console.log(mostActiveHours)
        // console.log(comparedWords)

        return {users, messages, usersMessagesCount, filteredMessages, messagesWords, mostActiveDays, mostActiveHours, mostActiveMonths, comparedWords};
    }
}

module.exports = WhatsappExtractor;



// TEST ZONE
