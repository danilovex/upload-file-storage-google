/*
  Business Rules
 */

var formidable = require('formidable');
var fs = require('fs');

const {
  Storage
} = require('@google-cloud/storage');

const projectId = '972918213844'; // Your Google Cloud Platform project ID
// Creates a client
const storage = new Storage({
  keyFilename: __dirname + '/pmcanvasapp-cbe81082180a.json',
  projectId: projectId,
});


exports.index = function (req, res) {
  res.render('index', {});
};

exports.uploadFile = function (req, res) {
  _uploadFile(req).then((result) => {
    return res.status(201).json({
      message: 'Files saved successfully!'
    });
  }).catch((err) => {
    return res.status(500).json(err);
  });

};

exports.listFiles = function (req, res) {
  _listFiles(req).then((result) => {
    return res.status(200).json(result);
  }).catch((err) => {
    return res.status(500).json(err);
  });
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

exports.generateSignedUrl = function (req, res) {
  _generateSignedUrl(req).then((result) => {
    return res.status(200).json({
      link: result
    });
  }).catch((err) => {
    return res.status(500).json(err);
  });

}

/*
 functions private
*/

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

function getBuckets() {
  return new Promise((resolve, reject) => {
    storage.getBuckets().then((result) => {
      resolve(result[0]);
    }).catch((err) => {
      reject(err);
    });
  });
}

function createBucket(name) {
  return new Promise((resolve, reject) => {
    storage.createBucket(name).then((result) => {
      resolve(result);
    }).catch((err) => {
      reject(err);
    });
  });
}

function upload(bucketName, file, folder) {
  return new Promise((resolve, reject) => {
    let options = {
      gzip: true,
      metadata: {
        cacheControl: 'no-cache',
        contentType: file.type
      }
    };
    var bucket = storage.bucket(bucketName);
    var readStream = fs.createReadStream(file.path);
    let fileName = file.name;
    if (folder) {
      fileName = folder + '/' + fileName;
    }
    var writeStream = bucket.file(fileName).createWriteStream(options);
    writeStream.on('error', (err) => {
      reject(err);
    });
    writeStream.on('finish', () => {
      resolve(true);
    });
    //writeStream.end();
    readStream.pipe(writeStream);
  });
}

async function _uploadFile(req) {

  let bucketName = req.query.bucketName;
  if (!bucketName) {
    throw 'Informed bucketName your file';
  }

  let form = await parseForm(req);

  let file = form.files.file;

  let buckets = await getBuckets(storage);

  let existsBuckect = false;
  buckets.forEach((bucket) => {
    if (bucket.name === bucketName) {
      existsBuckect = true;
    }
  });

  if (!existsBuckect) {
    await createBucket(bucketName);
  }

  await upload(bucketName, file, req.query.folder);

  return true;

}


async function _listFiles() {

  let buckets = await getBuckets();

  let files = [];
  for (let index = 0; index < buckets.length; index++) {
    let name = buckets[index].name;
    [tempFile] = await storage.bucket(name).getFiles();
    files.push.apply(files, tempFile);
  }

  return files.reduce(function (newList, file) {
    let value = {
      name: file.name,
      size: file.metadata.size,
      bucketName: file.bucket.name
    }
    newList.push(value);
    return newList;
  }, []);

}


async function _deleteFile(req) {

  let bucketName = req.query.bucket;
  let filename = req.query.name;

  await storage
    .bucket(bucketName)
    .file(filename)
    .delete();

  return true;
}

async function _generateSignedUrl(req) {

  let options = {
    action: 'read',
    expires: Date.now() + 1000 * 60 * 60, // one hour
  };

  let bucketName = req.query.bucket;
  let filename = req.query.name;

  const [url] = await storage
    .bucket(bucketName)
    .file(filename)
    .getSignedUrl(options);

  return url;
}