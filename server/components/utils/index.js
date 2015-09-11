'use strict';
var fs = require('fs');
var _ = require('lodash');

module.exports = {

  getCurrentDate: function(date){
    var dia=date.getDate();
    var mes=date.getMonth()+1;
    var anno=date.getFullYear();
    return dia+"/"+mes+"/"+anno;
  },
  getCurrentDateNoDelimitator: function(date){
    var dia=date.getDate();
    var mes=date.getMonth()+1;
    var anno=date.getFullYear();
    if(dia<10){
      dia='0'+dia.toString();
    }

    if(mes<10){
      mes='0'+mes.toString();
    }
    return dia.toString()+mes.toString()+anno.toString();
  },

 getCurrentTime:function(date){

    var hours = date.getHours() == 0 ? "12" : date.getHours() > 12 ? date.getHours() - 12 : date.getHours();

    var minutes = (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
    var ampm = date.getHours() < 12 ? "AM" : "PM";
    return  hours + ":" + minutes + " " + ampm;

  },

  pytonStringToJson:function(data){

    var data2=JSON.stringify(eval("(" + data + ")"));

    return JSON.parse(data2);

  },

  createPath : function(path){
    if (!fs.existsSync('./server'))
      fs.mkdirSync('./server');

    var dir_aux = '';
    try {      
      _.forEach(path.split('/'), function(path_section){          
        if (path_section !== ''){
          dir_aux += path_section + '/';
          if (!fs.existsSync(dir_aux))
            fs.mkdirSync(dir_aux);
        }
      });
      return dir_aux;
    } catch (e){
      console.log('e==>',e);
      return '';
    }

  },
//@path = 'entidad' @id= 1
  moveFromTempTo : function(file, target){
    //file.name ='entidad_'+id;
    var path = './server/uploads/images/'+target+'/';

    var result = {error : null, value:""};
    //console.log(path);
    if (file === null || file === undefined) {
      return result;
    }

    var checkPath = this.createPath(path);
    //console.log('checkPath==>',checkPath,'path==>',path);
    if (checkPath !== ''){

      var tmp_path = file.path.replace(/\\/g,"/");

      // set where the file should actually exists - in this case it is in the "images" directory

      var target_path = path+file.path.split("tmp/")[1];//+target+'_'+id+'.'+file.name.split(".")[1];

      try {
       
        // move the file from the temporary location to the intended location
       fs.renameSync(tmp_path, target_path);
        //fs.unlinkSync(tmp_path);
        result.value = target_path;
      } catch (e){
        result.error = e.message;
      }
    } else {
      result.error = 'Error creating path';
    }
    return result;
  },
  deletePath : function(path){
    try{
      
      /*if(!file)
        return true;*/
      if(!path)
        return true;
      fs.unlinkSync(path);
      return true;
    }
    catch(ex){
      return false;
    }
}

};
