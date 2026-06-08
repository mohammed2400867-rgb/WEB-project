const mongoose = require('mongoose');

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        console.error('\n=========================================');
        console.error('DATABASE CONFIGURATION ERROR:');
        console.error('MONGO_URI is not defined in your environment variables.');
        console.error('Please make sure a .env file exists in the project root directory');
        console.error('and contains a valid MONGO_URI definition, for example:');
        console.error('MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/dbname');
        console.error('=========================================\n');
        process.exit(1);
    }

    try {
        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (err) {
        console.error('\n=========================================');
        console.error('DATABASE CONNECTION ERROR:');
        console.error(err.stack || err.message || err);
        console.error('\nTROUBLESHOOTING GUIDE:');

        const errMsg = (err.message || '').toLowerCase();

        if (errMsg.includes('auth') || errMsg.includes('login') || errMsg.includes('credential')) {
            console.error('\n-> AUTHENTICATION FAILURE DETECTED:');
            console.error('1. Double check the database username and password in your MONGO_URI.');
            console.error('2. Special characters in the password (e.g. @, #, $, /, :) MUST be URL-encoded (e.g., replace @ with %40).');
            console.error('3. Check MongoDB Atlas -> Database Access. Make sure the database user exists.');
            console.error('4. Check if the database user has "Restrict Access to Specific IPs" enabled. If it does, disabled it or add all necessary IPs.');
        } else if (errMsg.includes('timeout') || errMsg.includes('closed') || errMsg.includes('enotfound') || errMsg.includes('econnrefused')) {
            console.error('\n-> CONNECTION TIMEOUT OR FIREWALL ISSUE DETECTED:');
            console.error('1. Verify your internet connection.');
            console.error('2. Check MongoDB Atlas -> Network Access. Ensure your IP address is whitelisted.');
            console.error('3. To allow access from anywhere (highly recommended for team testing), add "0.0.0.0/0" to the IP Access List.');
        } else {
            console.error('\n-> GENERAL MONGOOSE CONNECTION ISSUE:');
            console.error('1. Check if the MongoDB cluster URL is correct.');
            console.error('2. Go to your MongoDB Atlas dashboard to ensure the cluster is active and not paused.');
            console.error('3. Verify that your IP Address is whitelisted in Network Access.');
        }
        console.error('=========================================\n');
        process.exit(1);
    }
};

module.exports = connectDB;

