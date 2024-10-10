const db = require(__basedir + 'modules/db/base');
const fs = require('fs');
const gm = require('gm');
const util = require('util');

const base_path = './static/';
const images_path = base_path + global.App.serverConfig.fileUploadFolder;
const profiles_path = images_path + 'profiles/';
const profiles160_path = profiles_path + '160x160/';
const profiles32_path = profiles_path + '32x32/';

const uploadMiddleware = util.promisify(__multer.single('file'));

// Initialize the upload folders
initialize();

function initialize(){
  // Create upload images folder
  if(!fs.existsSync(images_path)){
    fs.mkdirSync(images_path);
  }

  // Create upload profiles
  if(!fs.existsSync(profiles_path)){
    fs.mkdirSync(profiles_path);
  }

  // Create upload size 32x
  if(!fs.existsSync(profiles32_path)){
    fs.mkdirSync(profiles32_path);
  }

  // Create upload size 160x
  if(!fs.existsSync(profiles160_path)){
    fs.mkdirSync(profiles160_path);
  }
}

function writePhoto(tmp_path, target_path, size){
  return new Promise ((resolve, reject) => {
    gm(tmp_path).resize(size, size).noProfile().write(target_path, function(err){

      if(err){
        return reject(err);
      }

      return  resolve();
    });
  
  })
}

async function processUpload(params){

  
  const userid = params.userid;
  const file = params.file;
  
  let tmp_path = file.path;

  // let target_path = images_path + file.filename;

  let folder32 = profiles32_path + Math.floor(userid / 1000) + '/';
  let folder160 = profiles160_path + Math.floor(userid / 1000) + '/';

  let target_path_32 = folder32 + file.filename.toLowerCase();
  let target_path_160 = folder160 + file.filename.toLowerCase();

  let url32 = target_path_32.slice(8);
  let url160 = target_path_160.slice(8);

  // let resize32 = null, resize160 = null;

  if(file.size === 0){
    return {error: 'File size 0'};
  }

  // console.log("> File size: ", file.size);

  try {
    // console.log("Identifying image")
    await gm(tmp_path);

    if(!fs.existsSync(folder32)){
      fs.mkdirSync(folder32);
    }

    if(!fs.existsSync(folder160)){
      fs.mkdirSync(folder160);
    }

    await writePhoto(tmp_path, target_path_32, 32);// gm(tmp_path).resize(32, 32).noProfile().write(target_path_32);
    await writePhoto(tmp_path, target_path_160, 160); //await gm(tmp_path).resize(160, 160).noProfile().write(target_path_160);

    fs.unlinkSync(tmp_path);
    
    const sql = "UPDATE webapp.users SET avatar = '" + url32 + "', mod_date = now() where id = " + params.userid;

    const result = await db.query(sql);

    if(result.error){
      return result;
    }
      
    return {
        error: null,
        size: file.size,
        url32: url32,
        url160: url160
    };

  } catch(error){
    return {error: error.message};
  }
}

export default async function (req, res, next) {
  console.log(">Upload Photo");

  let result,
      error;

  // Parse multipart-form
  error = await uploadMiddleware(req, res);

  if (error) {
      console.log("> Error parsing multipart form: ", error);
      res.send({ error: 'Server-side error.' });

      return;
  }

  const user = res.locals.user;

  if(req.hasOwnProperty('file')){
    result = await processUpload({
      userid: user.id,
      file: req.file
    });
  } 

  console.log(result)
  
  if(!result || result.error){
    res.send({error: 'Error uploading profile photo..'});
  } else {
    res.send(result);
  }
}

