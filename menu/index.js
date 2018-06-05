'use strict'

//  STATUS  DESCRIPTION
//  1200    service error
//  1100    information not found
//  1002    NSS NO VALIDO
//  -2      successful incomplate
//  0       successful

const vision = require('@google-cloud/vision');

const client = new vision.ImageAnnotatorClient();

var ocrDA = require('../../psqlDA/ocrDA');

var fs = require('fs');

var dictionary = JSON.parse(fs.readFileSync('./services/ocr/resource/expresiones/0.0.1.json', 'utf8'));


function msg(status, message, data) {
  let response = {};
  response.status = status;
  response.message = message;
  response.data = data;
  return response;
}

var getText = (file, texto) => {
  client
    .textDetection(file)
    .then(results => {
      const detections = results[0].textAnnotations;
      texto(true, detections[0].description);
    })
    .catch(err => texto(false, err));
};

var TELMEX = text => {
  let response;
  let temp = dictionary.TELMEX.domicilio;
  for (let i = 0; i < temp.length; i++) {
    let exp = new RegExp(temp[i].exp, temp[i].flag);
    let domicilio = exp.test(text) ? text.match(exp)[0].replace("\n", " ").match(/.{5}$/g)[0] : false;
    return domicilio;
  }
};

var CFE = text => {
  let response;
  let temp = dictionary.CFE.domicilio;
  let domicilio;
  for (let i = 0; i < temp.length; i++) {
    let exp = new RegExp(temp[i].exp, temp[i].flag);
    domicilio = exp.test(text) ? text.match(exp)[0].match(/.{5}$/ig)[0] : false;
    return domicilio;
  }
};

var IZZI = text => {
  let response = {
    status: 0,
    message: "successful",
    data: {}
  };
  let temp = dictionary.IZZI.domicilio;

  for (let i = 0; i < temp.length; i++) {
      let exp = new RegExp(temp[i].exp, temp[i].flag);
      let domicilio = exp.test(text) ? text.match(exp)[0].replace(/\n/ig, " ").match(/.{5}$/g)[0] : false;
      return domicilio;
  }
};

var COMRPOBANTE = (name, call) => {
  getText(name, (flag, aLine) => {
    if (!flag) {
      return call(msg('service error', 1200));
    }
    if (aLine.match(/(cfe|Comisión Federal)/igm) != null) {
      return call(CFE(aLine));
    } else if (aLine.match(/(telmex|telefonos de mexico)/img) != null) {
      return call(TELMEX(aLine));
    } else if (aLine.match(/(izzi)/img)) {
      return call(IZZI(aLine));
    }
    return call(false);
  });
};

var TARJECT = (name, call) => {
  getText(name, (flag, aLine) => {
    if (!flag) {
      return call({
        status: 1200,
        message: "service error",
        data: {}
      });
    }
    let response;
    let temp = dictionary.TARJECT.numero;
    for (let i = 0; i < temp.length; i++) {
      try {
        let exp = new RegExp(temp[i].exp, temp[i].flag);
        let tarjeta = aLine.match(exp)[0].replace(/[lL]/g, "1")
          .replace(/[oO]/g, "0").replace(/b/g, "6").replace(/\n/gi, "");
        response = msg('successful', 0, {
          'tarjeta': tarjeta
        });
        break;
      } catch (err) {
        response = msg('information not found', 1100);
      }
    }
    call(response);
  });
};

var FOLIO_FISCAL = (name, call) => {
  getText(name, (flag, aLine) => {
    if (!flag) {
      return call({
        status: 1200,
        message: "service error",
        data: {}
      });
    }
    let response;

    let temp = dictionary.NOMINA.FOLIO_FISCAL;

    for (let i = 0; i < temp.length; i++) {
      try {
        let exp = new RegExp(temp[i].exp, temp[i].flag);
        let folio;
        if (exp.test(aLine)) {
          folio = aLine.match(exp)[0];
          folio = folio.includes("\n") ? folio.split('\n')[1] : folio;
          response = msg("successful", 0, {
            FOLIO_FISCAL: folio
          });
          break;
        }
      } catch (err) {
        response = msg("information not found", 1100);
      }
    }
    call(response);
  });
};



var IFE = (name, call) => {
  getText(name, (flag, aLine) => {
    let response = {
      status: 0,
      message: "successful",
      data: {}
    };
    if (!flag) {
      return call({
        status: 1200,
        message: "service error",
        data: {}
      });
    }
    let lines = aLine;
    aLine = aLine.replace(/\n/igm, " ");
    let temp = dictionary.INE.curp;
    for (let i = 0; i < temp.length; i++) {
      let exp = new RegExp(temp[i].exp, temp[i].flag);
      try {
        let c = aLine.match(exp)[0].replace(/(curp) /i, "");
        console.log("c");
        console.log(c);
        response.data.curp = c;
        let c1 = c.match(/^[a-z0]{4}/ig)[0].replace(/0/ig, "O");
        let c2 = c.replace(/^.{4}/ig, "").match(/^[0-9a-z]{6}/ig)[0].replace(/[o]/ig, "0");
        response.data.birthday = `19${c2[0]}${c2[1]}-${c2[2]}${c2[3]}-${c2[4]}${c2[5]}`;
        response.data.rfc = c1 + c2;
        let c3 = c.replace(/^.{10}/g, "").match(/^[a-z0-9]{6}/ig)[0].replace(/[0]/, "O");
        response.data.sexo = c3[0];
        let c4 = c.replace(/.{16}/, "").replace(/[o]/ig, "0");
        exp = new RegExp(/^.\w{2}/, 'ig');
        response.data.estado_nacimiento = exp.test(c3) ? c3.match(exp)[0].replace(/./, '') : '';
        response.data.curp = c1 + c2 + c3 + c4;
        console.log("curp");
        console.log(response.data.curp);
        response.status = 0;
        response.message = "successful";
        break;
      } catch (err) {
        response.status = -2;
        response.message = "information not found for CURP";
      }
    }
    temp = dictionary.INE.nombre;
    for (let i = 0; i < temp.length; i++) {
      let exp = new RegExp(temp[i].exp, temp[i].flag);
      try {
        let nombre = aLine.match(exp)[0]
          .replace(/( domicilio)/ig, "").replace(/[0]/ig, "O").replace(/(nombre )/ig, "");
        let nombresplit = nombre.split(" ");
        response.data.paterno = nombresplit[0];
        response.data.materno = nombresplit[1];
        response.data.nombre = nombresplit.length == 4 ? nombresplit[2] + " " + nombresplit[3] : nombresplit[2];
        response.status = 0;
        response.message = "successful";
      } catch (err) {
        response.status = -2;
        response.message = "information not found for NAME";
      }
    }
    temp = dictionary.INE.clave;
    for (let i = 0; i < temp.length; i++) {
      let exp = new RegExp(temp[i].exp, temp[i].flag);
      try {
        let clave = aLine.match(exp)[0]
          .replace(/(CLAVE DE ELECTOR )/ig, "");
        response.data["clave electoral"] = clave;
        response.status = 0;
        response.message = "successful";
      } catch (err) {
        response.status = -2;
        response.message = "information incomplate";
      }
    }
    if (undefined == response.data.estado_nacimiento && response.status == -2) return call(msg("information not found", 1100));
    ocrDA.GET_STATE_BY_CODE(response.data.estado_nacimiento, resp => {

      if (!response) return res.send(msg(5000, 'E R R O R - G E N E R A L', {}));
      if (response == 1200) return res.send(msg(1200, 'T Y P E - D A T A', {}));
      response.data.estado_nacimiento = resp;
      return call(response);
    });
  });
};

var BACK_INE = (name, call) => {
  getText(name, (flag, aLine) => {
    let response;
    let temp = dictionary.BACK_INE.ID;
    for (let i = 0; i < temp.length; i++) {
      let exp = new RegExp(temp[i].exp, temp[i].flag);
      let folio;
      if (exp.test(aLine)) {
        console.log(1);
        folio = aLine.match(exp)[0];
        return call(msg(0, "successful", {folio: folio}));
      }
      else {
        response = msg("information not found", 1100);
      }
    }
    call(response);
  });
};

var validateNSS = nss => {
  let firstNum = nss.match(/\d{10}/)[0];
  let totales = [];
  for (let i = 0; i < firstNum.length; i++) {
    let num = parseInt(firstNum.charAt(i));
    if (i % 2 == 0) totales.push(num * 1);
    else totales.push(num * 2);
  }
  let total = 0;
  totales.forEach((e, i) => {
    if (String(e).length == 2) {
      total += parseInt(String(e).charAt(0)) + parseInt(String(e).charAt(1));
    } else {
      total += e;
    }
  });
  return total % 10;
};

var NSS = (name, call) => {
  getText(name, (flag, aLine) => {
    if (!flag) {
      return call({
        status: 1200,
        message: "service error",
        data: {}
      });
    }
    let response = {
      status: 0,
      message: "successful",
      data: {}
    };
    let temp = dictionary.NSS.numero;
    for (let i = 0; i < temp.length; i++) {
      try {
        let exp = new RegExp(temp[i].exp, temp[i].flag);
        let nss = aLine.match(exp)[0].replace(/[lL]/g, "1")
          .replace(/[oO]/g, "0").replace(/b/g, "6").replace(/\s{1}/g, "-");
        if (validateNSS(nss) != nss.match(/\d$/)) {
          response = msg('NSS no valido', 1002, {
            'nss': nss
          });
          break;
        }
        response = msg('successful', 0, {
          'nss': nss
        });
        break;
      } catch (err) {
        response = msg("information not found", 1100);
      }
    }
    call(response);
  });
};

module.exports = {
  IFE,
  BACK_INE,
  COMRPOBANTE,
  TARJECT,
  NSS,
  FOLIO_FISCAL
};
