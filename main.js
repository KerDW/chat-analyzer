const WhatsappExtractor = require('./extractors/whatsapp-extractor');


function run(options) {
    if (options.file) {
        const we = new WhatsappExtractor(options.file);
        // console.log(we.extract());
        we.extract();
    }
}

// Parse terminal args
const options = {};
process.argv.splice(2).map(a => {
    const argument = a.replace(/--/g,'').split(/=/g);
    options[argument[0]] = argument[1];
});


run(options);

