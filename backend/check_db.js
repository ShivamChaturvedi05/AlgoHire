import mongoose from 'mongoose';

import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;

const questionSchema = new mongoose.Schema({
    title: String,
    description: String,
    testCases: Array
}, { strict: false });

const Question = mongoose.model('Question', questionSchema);

async function check() {
    await mongoose.connect(uri);
    const questions = await Question.find({});
    console.log("Found", questions.length, "questions:");
    for (const q of questions) {
        console.log(`- ${q.title} | TestCases length: ${q.testCases?.length || 0}`);
        if (q.testCases?.length > 0) {
            console.log(`  Test Case 0:`, q.testCases[0]);
        }
    }
    mongoose.disconnect();
}

check().catch(console.error);
