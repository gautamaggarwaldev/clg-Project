import mongoose from "mongoose";
import config from "./index.js";

// If a query includes fields that are not defined in the schema, 
// Mongoose ignores them instead of throwing an error.
mongoose.set("strictQuery", true);

mongoose.connect(config.DB_URL).then(() => {
    console.log("Mongoose connection is successfully done...");
}).catch((err) => {
    console.log("Mongoose connection is failed...");
    console.log(err);
});

mongoose.connection.on("connected", () => {
    console.log("Mongoose default connection with database is + " + config.DB_URL);
});

mongoose.connection.on("error", (err) => {
    console.log("Mongoose error connection is + " + err);
});

mongoose.connection.on("disconnected", () => {
    console.log("Mongoose default connection is disconnected...");
});


// It is a event listener, it triggers when the user press ctrl+c to terminate the app
process.on("SIGINT", async() => {
    await mongoose.connection.close();
    console.log("Mongoose connection is disconnected due to app termination...");
    process.exit(0);
});


export default mongoose.connection;