'use strict';

const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema({
    Title : [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    Field : String,
    Url : String,
    ImgUrl : String,
    Views : Number,
    SavedDate : Date,
});


module.exports = mongoose.model('FieldNews', FieldSchema);