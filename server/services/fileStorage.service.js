// Models
const Node = require("../models/node.model");

// -------------------------------------IMPORTS-------------------------------------

class MongoFileStorage {
    async getContent(fileId) {
        const file = await Node.findById(fileId);

        return file.content;
    };

    async setContent (fileId, content) {
        const file = await Node.findById(fileId);

        file.content = content;

        await file.save();
    };
};

const fileStorage = process.env.STORAGE === "mongo" ? new MongoFileStorage() : {};

module.exports = fileStorage;