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
      var result = {error : 'field file empty', value:""};
      return result;
    }

    var checkPath = this.createPath(path);
    //console.log('checkPath==>',checkPath,'path==>',path);
    if (checkPath !== ''){

      var tmp_path = file.path.replace(/\\/g,"/");

      // set where the file should actually exists - in this case it is in the "images" directory

      var target_path = path+tmp_path.split("tmp/")[1];//+target+'_'+id+'.'+file.name.split(".")[1];

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
  },
  setUserLvl : function(user, points, requiredPoints){
    user.loyaltyPoints+=points;
    console.log('loyaltyPoints',user.loyaltyPoints);
    console.log('requiredPoints',requiredPoints);
    if(user.loyaltyPoints>=requiredPoints){
      user.loyaltyPoints= user.loyaltyPoints - requiredPoints;
      user.lvl++;
    }
    return user;
  },
  getLvls : function(){
    var lvls = [
      {
        "lvl":1,
        "points":50000,
        "color": "#4DD0E1"
      },
      {
        "lvl":2,
        "points":100000,
        "color": "#4FC3F7"
      },
      {
        "lvl":3,
        "points":150000,
        "color": "#AED581"
      },
      {
        "lvl":4,
        "points":200000,
        "color": "#81C784"
      },
      {
        "lvl":5,
        "points":250000,
        "color": "#FFCA28"
      },
      {
        "lvl":6,
        "points":300000,
        "color": "#FFB74D"
      },
      {
        "lvl":7,
        "points":350000,
        "color": "#FF8A65"
      },
      {
        "lvl":8,
        "points":400000,
        "color": "#ef5350"
      },
      {
        "lvl":9,
        "points":450000,
        "color": "#9575CD"
      },
      {
        "lvl":10,
        "points":500000,
        "color": "#F06292"
      }
    ]
    return lvls;
  }

};
