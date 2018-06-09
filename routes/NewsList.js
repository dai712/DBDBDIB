'use strict';

const mongoose = require('mongoose');

const NewsList= new mongoose.Schema({
    FieldNews: [String],
    PressNews: [String]
});


module.exports = mongoose.model('NewsList', NewsList);