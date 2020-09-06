const fs = require('fs');

/**
 * File Class
 */
 class File {
    constructor(src, type='utf8') {
        this.src = src;
        this.type = type
    }

    read() {
        // TODO check if src is an url and fetch it
        return fs.readFileSync(this.src, this.type);
    }

    write() {}
 }

module.exports = File;

 // TEST ZONE

 /*
const examplesFolder = '../utils/examples/';
const files = fs.readdirSync(examplesFolder).map(f => new File(`${examplesFolder}/${f}`));

for (const f of files) {
    console.log(`FILE - ${f.src}`);
    const data = f.read();
    console.log(data);
}*/