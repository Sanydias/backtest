const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    username : { type : 'string', required : true, unique : true},
    email : { type : 'string', required : true, unique : true},
    password : { type : 'string', required : true},
    ppname : { type : 'string'},
    date : { type : 'date', default : false},
    admin : { type : 'boolean', default : false}
});

module.exports = mongoose.model('User', userSchema);