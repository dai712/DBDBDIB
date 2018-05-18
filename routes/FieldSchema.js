'use strict';

const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema({
    Title : String,
    Field : String,
    Url : String,
    ImgUrl : String,
});


module.exports = mongoose.model('FieldNews', FieldSchema);