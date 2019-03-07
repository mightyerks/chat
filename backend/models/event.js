const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure 
const EventSchema = new Schema(
    {
        name: String, // username
        room: String, 
        event: String, // posted a message, connected, disconnected, joined/left room (?)
        timestamp: { type: Date, default: Date.now}
    },
    {collection: "events"}
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("Event", EventSchema);