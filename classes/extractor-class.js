const File = require('../classes/file-class');

/**
 * Extractor Class
 */
 class Extractor {
    constructor(src) {
        this.file = new File(src);
        this.rawData = null;
    }

    loadData(src) {
        if (src) {
            this.file = new File(src);
        }

        this.rawData = this.file.read();
        return this.rawData;
    }

 }


 module.exports = Extractor;