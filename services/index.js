/*
  Business Rules
 */

var formidable = require('formidable')

exports.index = function(req, res){
  res.render('index', {});
};

exports.uploadFiles = function(req, res){
  console.log(req.body);  

  var form = new formidable.IncomingForm();
 
  form.parse(req, function(err, fields, files) {
    console.log({fields: fields, files: files});
    res.status(200).json({ message: 'Files saved successfully!' });
  });

};
