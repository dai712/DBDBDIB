'use strict';

const mongoose = require('mongoose');

const PressSchema = new mongoose.Schema({
    Title : String,
    Press : String,
    Url : String,
    ImgUrl : String,
    Views : Number,
    SavedDate: Date,
});


module.exports = mongoose.model('PressNews', PressSchema);