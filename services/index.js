/*
  Business Rules
 */

var formidable = require('formidable');
var pkgcloud = require('pkgcloud');
var fs = require('fs');
var Cache = require("cache");
c = new Cache(1000 * 1000);    // Create a cache with 1000 second TTL

exports.index = function (req, res) {
  res.render('index', {});
};

/*
 functions private
*/

function getContainer(name, rackspace) {
  return new Promise((resolve, reject) => {
    rackspace.getContainer(name, function (err, container) {
      if (err && err.statusCode !== 404) {
        reject(err);
      }
      resolve(container);
    });
  });
}

function createContainer(name, rackspace) {
  return new Promise((resolve, reject) => {
    rackspace.createContainer({
      name: name,
      metadata: {
        client: 'danilovex@gmail.com'
      }
    }, function (err, container) {
      if (err) {
        reject(err);
      }
      resolve(container);
    });
  });
}

function upload(rackspace, nameContainer, file) {
  return new Promise((resolve, reject) => {

    var options = {
      // required options
      container: nameContainer, // this can be either the name or an instance of container
      remote: file.name, // name of the new file
      contentType: file.type, // optional mime type for the file, will attempt to auto-detect based on remote name
      size: file.size // size of the file
    }

    var readStream = fs.createReadStream(file.path);

    var writeStream = rackspace.upload(options);

    writeStream.on('error', function (err) {
      // handle your error case
      debugger;
      reject(err);
    });

    writeStream.on('success', function (file) {
      // success, file will be a File model
      debugger;
      resolve(file);
    });

    readStream.pipe(writeStream);

  });

}

function parseForm(req) {
  return new Promise((resolve, reject) => {
    var form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {

      if (err) {
        reject(err);
      }
      resolve({
        fields: fields,
        files: files
      });

    });
  });
}

function createClientRackspace() {
  return pkgcloud.storage.createClient({
    provider: 'rackspace', // required
    username: 'username', // required
    apiKey: 'apiKey', // required
    region: 'IAD', // required, regions can be found at
    // http://www.rackspace.com/knowledge_center/article/about-regions
    useInternal: false // optional, use to talk to serviceNet from a Rackspace machine
  });
}

async function _uploadFile(req) {

  let form = await parseForm(req);

  let file = form.files.file;
  let nameContainer = 'ClienteXPTO';

  var rackspace = createClientRackspace();

  let container = await getContainer(nameContainer, rackspace);

  //verify container exists
  if (!container) {
    await createContainer(nameContainer, rackspace);
  }

  await upload(rackspace, nameContainer, file);

  return true;


}

exports.uploadFile = function (req, res) {
  _uploadFile(req).then((result) => {
    return res.status(201).json({
      message: 'Files saved successfully!'
    });
  }).catch((err) => {
    return res.status(500).json(err);
  });

};

function getFiles(rackspace, container, start, limit){
  return new Promise((resolve, reject) => {
    let options = {
      marker: start,
      limit: limit
    };
    rackspace.getFiles(container, [options], function(err, files) {
      if (err) {
        reject(err);
      }
      resolve(files);
     });
  });
}

async function _listFiles(){

  if(c.get('files')){
    return c.get('files');
  }

  var rackspace = createClientRackspace();
  let nameContainer = 'ClienteXPTO';
  let container = await getContainer(nameContainer, rackspace);

  //verify container exists
  if (!container && container.count === 0) {
    return [];
  }  

  let maxFiles = container.count;
  let files = await getFiles(rackspace, nameContainer, 0, maxFiles);
  
  //files = JSON.parse(JSON.stringify(files));
  c.put('files', files);
  return files;

}

exports.listFiles = function (req, res) {
  _listFiles(req).then((result) => {
    return res.status(200).json(result);
  }).catch((err) => {
    return res.status(500).json(err);
  });
}

function getFile(rackspace, container, file){
  return new Promise((resolve, reject) => {
    rackspace.getFile(container, file, function(err, result) {
      if (err) {
        reject(err);
      }
      resolve(result);
     });
  });

}

function deleteFile(rackspace, container, file){
  return new Promise((resolve, reject) => {
    rackspace.removeFile(container, file, function(err, result) {
      if (err) {
        reject(err);
      }
      resolve(result);
     });
  });

}

async function _deleteFile(req){
  let nameContainer = 'ClienteXPTO';
  let files = c.get('files');
  let file = files.filter((x) => {
    return x.name === req.params.name;
  })[0];

  var rackspace = createClientRackspace();

  let result = await deleteFile(rackspace, nameContainer, file);
  return result;
}

  exports.deleteFile = function (req, res) {
    _deleteFile(req).then((result) => {
      return res.status(200).json({
        message: 'Files deleted successfully!'
      });
    }).catch((err) => {
      return res.status(500).json(err);
    });
  }

  function generateTempUrl(rackspace, container, file){
    return new Promise((resolve, reject) => {
          //client.generateTempUrl (container, file, method, time, key, callback)
      rackspace.generateTempUrl(container, file, 'GET', 60, 'CHAVEPRIVADA', function(err, result) {
        if (err) {
          reject(err);
        }
        resolve(result);
       });
    });
  
  }

  async function _downloadFile(req){
    let nameContainer = 'ClienteXPTO';
    let files = c.get('files');
    let file = files.filter((x) => {
      return x.name === req.params.name;
    })[0];
  
    var rackspace = createClientRackspace();
  
    let result = await generateTempUrl(rackspace, nameContainer, file);
    //https://github.com/pkgcloud/pkgcloud/search?q=generateTempUrl&unscoped_q=generateTempUrl

    return result;
  } 
  
  exports.downloadFile = function (req, res) {
      _downloadFile(req).then((result) => {
        return res.status(200).json({
          link: result
        });
      }).catch((err) => {
        return res.status(500).json(err);
      });    

}