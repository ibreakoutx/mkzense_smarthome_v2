var express = require('express');
var router = express.Router();
const deviceInfo = require("../deviceinfo");

/* POST */
router.post('/', accessRestrictedArea );

function accessRestrictedArea(req, res) {

      var mqttClient = res.locals.mqttClient ;

      var userId = res.locals.userId;

      //res.send('You have gained access to the area')
      console.log('post /smarthome', req.headers);

      let reqdata = req.body;
      console.log('post /smarthome', reqdata);

      //let authToken = authProvider.getAccessToken(request);
      //let uid = datastore.Auth.tokens[authToken].uid;

      //If no inputs , malformed request
      if (!reqdata.inputs) {
        res.status(401).set({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }).json({error: "missing reqdata inputs"});
        return;
      }

      for (let i = 0; i < reqdata.inputs.length; i++) {
        let input = reqdata.inputs[i];
        console.log("input = " + input);
        let intent = input.intent;

        if (!intent) {
          res.status(401).set({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }).json({error: "missing intent inputs"});
          return;
        }

        switch (intent) {
          case "action.devices.SYNC":
          console.log('post /smarthome SYNC');
        /**
         * request:
         * {
         *  "requestId": "ff36a3cc-ec34-11e6-b1a0-64510650abcf",
         *  "inputs": [{
         *      "intent": "action.devices.SYNC",
         *  }]
         * }
         */
         sync({
           //uid: uid,
           //auth: authToken,
           requestId: reqdata.requestId
         }, res);
         break;

         case "action.devices.QUERY":
          console.log('post /smarthome QUERY');
        /**
         * request:
         * {
         *   "requestId": "ff36a3cc-ec34-11e6-b1a0-64510650abcf",
         *   "inputs": [{
         *       "intent": "action.devices.QUERY",
         *       "payload": {
         *          "devices": [{
         *            "id": "123",
         *            "customData": {
         *              "fooValue": 12,
         *              "barValue": true,
         *              "bazValue": "alpaca sauce"
         *            }
         *          }, {
         *            "id": "234",
         *            "customData": {
         *              "fooValue": 74,
         *              "barValue": false,
         *              "bazValue": "sheep dip"
         *            }
         *          }]
         *       }
         *   }]
         * }
         */
         query({
           //uid: uid,
           //auth: authToken,
           requestId: reqdata.requestId,
           devices: reqdata.inputs[0].payload.devices
         }, res);

        break;
        case "action.devices.EXECUTE":
          console.log('post /smarthome EXECUTE');
        /**
         * request:
         * {
         *   "requestId": "ff36a3cc-ec34-11e6-b1a0-64510650abcf",
         *   "inputs": [{
         *     "intent": "action.devices.EXECUTE",
         *     "payload": {
         *       "commands": [{
         *         "devices": [{
         *           "id": "123",
         *           "customData": {
         *             "fooValue": 12,
         *             "barValue": true,
         *             "bazValue": "alpaca sauce"
         *           }
         *         }, {
         *           "id": "234",
         *           "customData": {
         *              "fooValue": 74,
         *              "barValue": false,
         *              "bazValue": "sheep dip"
         *           }
         *         }],
         *         "execution": [{
         *           "command": "action.devices.commands.OnOff",
         *           "params": {
         *             "on": true
         *           }
         *         }]
         *       }]
         *     }
         *   }]
         * }
         */
        exec({
          //uid: uid,
          //auth: authToken,
          requestId: reqdata.requestId,
          commands: reqdata.inputs[0].payload.commands
        }, res);

        break;

       default:
        res.status(401).set({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }).json({error: "missing intent"});
        break;
    } //switch
  } //for
} //function

/**
 * Enables prelight (OPTIONS) requests made cross-domain.
 */

 /*
app.options('/smarthome', function (request, response) {
  response.status(200).set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  }).send('null');
});
*/

/**
 *
 * @param data
 * {
 *   "uid": "213456",
 *   "auth": "bearer xxx",
 *   "requestId": "ff36a3cc-ec34-11e6-b1a0-64510650abcf"
 * }
 * @param response
 * @return {{}}
 * {
 *  "requestId": "ff36a3cc-ec34-11e6-b1a0-64510650abcf",
 *   "payload": {
 *     "devices": [{
 *         "id": "123",
 *         "type": "action.devices.types.Outlet",
 *         "traits": [
 *            "action.devices.traits.OnOff"
 *         ],
 *         "name": {
 *             "defaultNames": ["TP-Link Outlet C110"],
 *             "name": "Homer Simpson Light",
 *             "nicknames": ["wall plug"]
 *         },
 *         "willReportState: false,
 *         "attributes": {
 *         // None defined for these traits yet.
 *         },
 *         "roomHint": "living room",
 *         "config": {
 *           "manufacturer": "tplink",
 *           "model": "c110",
 *           "hwVersion": "3.2",
 *           "swVersion": "11.4"
 *         },
 *         "customData": {
 *           "fooValue": 74,
 *           "barValue": true,
 *           "bazValue": "sheepdip"
 *         }
 *       }, {
 *         "id": "456",
 *         "type": "action.devices.types.Light",
 *         "traits": [
 *           "action.devices.traits.OnOff",
 *           "action.devices.traits.Brightness",
 *           "action.devices.traits.ColorTemperature",
 *           "action.devices.traits.ColorSpectrum"
 *         ],
 *         "name": {
 *           "defaultNames": ["OSRAM bulb A19 color hyperglow"],
 *           "name": "lamp1",
 *           "nicknames": ["reading lamp"]
 *         },
 *         "willReportState: false,
 *         "attributes": {
 *           "TemperatureMinK": 2000,
 *           "TemperatureMaxK": 6500
 *         },
 *         "roomHint": "living room",
 *         "config": {
 *           "manufacturer": "osram",
 *           "model": "hg11",
 *           "hwVersion": "1.2",
 *           "swVersion": "5.4"
 *         },
 *         "customData": {
 *           "fooValue": 12,
 *           "barValue": false,
 *           "bazValue": "dancing alpaca"
 *         }
 *       }, {
 *         "id": "234"
 *         // ...
 *     }]
 *   }
 * }
 */
function sync(data, response) {
  console.log('sync', JSON.stringify(data));
  /*
  //let devices = app.smartHomePropertiesSync(data.uid);
  if (!devices) {
    response.status(500).set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }).json({error: "failed"});
    return;
  }


  let deviceList = [];
  Object.keys(devices).forEach(function (key) {
    if (devices.hasOwnProperty(key) && devices[key]) {
      console.log("Getting device information for id '" + key + "'");
      let device = devices[key];
      device.id = key;
      deviceList.push(device);
    }
  });
*/
  let deviceProps = {
    requestId: data.requestId,
    payload: deviceInfo.syncResponsePayload
  };
  console.log('sync response', JSON.stringify(deviceProps));
  response.status(200).json(deviceProps);
  return deviceProps;
}

/**
 *
 * @param data
 * {
 *   "requestId": "ff36a3cc-ec34-11e6-b1a0-64510650abcf",
 *   "uid": "213456",
 *   "auth": "bearer xxx",
 *   "devices": [{
 *     "id": "123",
 *       "customData": {
 *         "fooValue": 12,
 *         "barValue": true,
 *         "bazValue": "alpaca sauce"
 *       }
 *   }, {
 *     "id": "234"
 *   }]
 * }
 * @param response
 * @return {{}}
 * {
 *  "requestId": "ff36a3cc-ec34-11e6-b1a0-64510650abcf",
 *   "payload": {
 *     "devices": {
 *       "123": {
 *         "on": true ,
 *         "online": true
 *       },
 *       "456": {
 *         "on": true,
 *         "online": true,
 *         "brightness": 80,
 *         "color": {
 *           "name": "cerulian",
 *           "spectrumRGB": 31655
 *         }
 *       },
 *       ...
 *     }
 *   }
 * }
 */
function query(data, response) {
  console.log('query', JSON.stringify(data));
  let deviceIds = getDeviceIds(data.devices);

/*
  let devices = app.smartHomeQueryStates(data.uid, deviceIds);
  if (!devices) {
    response.status(500).set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }).json({error: "failed"});
    return;
  }
*/

  let devices={};
  deviceIds.forEach((item)=>{
    devices[item] = {};
    devices[item]["on"] = true;
    devices[item]["online"] = true;
  });

  let deviceStates = {
    requestId: data.requestId,
    payload: {
      devices: devices
    }
  };

  console.log('query response', JSON.stringify(deviceStates));
  response.status(200).json(deviceStates);
  return deviceStates;
}

/**
 *
 * @param devices
 * [{
 *   "id": "123"
 * }, {
 *   "id": "234"
 * }]
 * @return {Array} ["123", "234"]
 */
function getDeviceIds(devices) {
  let deviceIds = [];
  for (let i = 0; i < devices.length; i++) {
    if (devices[i] && devices[i].id)
      deviceIds.push(devices[i].id);
  }
  return deviceIds;
}

/**
 * @param data:
 * {
 *   "requestId": "ff36a3cc-ec34-11e6-b1a0-64510650abcf",
 *   "uid": "213456",
 *   "auth": "bearer xxx",
 *   "commands": [{
 *     "devices": [{
 *       "id": "123",
 *       "customData": {
 *          "fooValue": 74,
 *          "barValue": false
 *       }
 *     }, {
 *       "id": "456",
 *       "customData": {
 *          "fooValue": 12,
 *          "barValue": true
 *       }
 *     }, {
 *       "id": "987",
 *       "customData": {
 *          "fooValue": 35,
 *          "barValue": false,
 *          "bazValue": "sheep dip"
 *       }
 *     }],
 *     "execution": [{
 *       "command": "action.devices.commands.OnOff",
 *       "params": {
 *           "on": true
 *       }
 *     }]
 *  }
 *
 * @param response
 * @return {{}}
 * {
 *   "requestId": "ff36a3cc-ec34-11e6-b1a0-64510650abcf",
 *   "payload": {
 *     "commands": [{
 *       "ids": ["123"],
 *       "status": "SUCCESS"
 *       "states": {
 *         "on": true,
 *         "online": true
 *       }
 *     }, {
 *       "ids": ["456"],
 *       "status": "SUCCESS"
 *       "states": {
 *         "on": true,
 *         "online": true
 *       }
 *     }, {
 *       "ids": ["987"],
 *       "status": "OFFLINE",
 *       "states": {
 *         "online": false
 *       }
 *     }]
 *   }
 * }
 */
function exec(data, response) {
  console.log('exec', JSON.stringify(data));

  let respCommands = [];
  for (let i = 0; i < data.commands.length; i++) {
    let curCommand = data.commands[i];

    for (let j = 0; j < curCommand.execution.length; j++) {

      let curExec = curCommand.execution[j];
      let devices = curCommand.devices;

	var executionResponse;
	var processResponse = function(status) {
	    executionResponse = status;
            console.log("Device exec response", JSON.stringify(status));
	}

      for (let k = 0; k < devices.length; k++) {

        execDevice(deviceInfo.id, curExec, devices[k], processResponse );

        respCommands.push({
          ids: [devices[k].id],
          status: executionResponse.status,
          errorCode: executionResponse.errorCode ? executionResponse.errorCode : undefined
        });
      }
    }
  }
  let resBody = {
    requestId: data.requestId,
    payload: {
      commands: respCommands
    }
  };
  console.log('exec response', JSON.stringify(resBody));
  response.status(200).json(resBody);
  return resBody;

}

//registerAgent.exec = exec;

/**
 *
 * @param uid
 * @param command
 * {
 *   "command": "action.devices.commands.OnOff",
 *   "params": {
 *       "on": true
 *   }
 * }
 * @param device
 * {
 *   "id": "123",
 *   "customData": {
 *      "fooValue": 74,
 *      "barValue": false
 *   }
 * }
 * @return {{}}
 * {
 *   "ids": ["123"],
 *   "status": "SUCCESS"
 *   "states": {
 *     "on": true,
 *     "online": true
 *   }
 * }
 */
function execDevice(uid, command, device, cbk) {

  console.log ("** command = " + JSON.stringify(command));

  let curDevice = {
    id: device.id,
    states: {}
  };

  Object.keys(command.params).forEach(function (key) {
    if (command.params.hasOwnProperty(key)) {
      curDevice.states[key] = command.params[key];
    }
  });

  let payLoadDevice = {
    ids: [curDevice.id],
    status: "SUCCESS",
    states: {online: true, on: true}
  };

  /*
  let execDevice = app.smartHomeExec(uid, curDevice);

  console.info("execDevice", JSON.stringify(execDevice[device.id]));

  // Check whether the device exists or whether it exists and it is disconnected.
  if (!execDevice || !execDevice[device.id].states.online) {
    console.warn("The device you want to control is offline");
    return {status: "ERROR", errorCode: "deviceOffline"};
  }
  let deviceCommand = {
    type: 'change',
    state: {}
  };

  // TODO - add error and debug to response

  deviceCommand.state[curDevice.id] = execDevice[curDevice.id].states;

  app.changeState(deviceCommand);

  execDevice = execDevice[curDevice.id];

  payLoadDevice.states = execDevice.states;
*/

    /*
  Object.keys(command.params).forEach(function (key) {
    if (command.params.hasOwnProperty(key)) {
      if (payLoadDevice.states[key] != command.params[key]) {
          cbk( {status: "ERROR", errorCode: "notSupported"} );
      }
    }
  });
*/

    /*
Turn fan off
** command = {"command":"action.devices.commands.OnOff","params":{"on":false}}

Turn fan on
** command = {"command":"action.devices.commands.OnOff","params":{"on":true}}

set fan speed low
** command = {"command":"action.devices.commands.SetFanSpeed","params":{"fanSpeed":"Low"}}

set fan speed medium
** command = {"command":"action.devices.commands.SetFanSpeed","params":{"fanSpeed":"Medium"}}

set fan speed high
** command = {"command":"action.devices.commands.SetFanSpeed","params":{"fanSpeed":"High"}}
     */
    var mqttMessage ;
    switch( command.command ) {
    case "action.devices.commands.OnOff" :
	if ( command.params.on ) {
	    mqttMessage = "ON_FAN" ;
	}
	else {
	    mqttMessage = "OFF_FAN" ;
	}
	break;

    case "action.devices.commands.SetFanSpeed":
	mqttMessage = "FAN_SPEED_" + command.params.fanSpeed.toUpperCase() ;
	break;

    default:
	mqttMessage = "FAN_UNKNOWN_COMMAND";
	break;
    }

  mqttClient.publish("sensorsiot/feeds/command",mqttMessage,{}, (err) => {
    if (!err)
	cbk({status: "SUCCESS"});
    else
	cbk({status: "ERROR", errorCode: "MQTT error"});
  })

}

module.exports = router;
