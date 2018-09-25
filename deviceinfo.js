module.exports = {
  "agentUserId": "16237.2837",
  "id":"987",
  //Copied from https://developers.google.com/actions/smarthome/guides/fan#response
  "syncResponsePayload":  {
    "agentUserId": "16237.2837",
    "devices": [{
      "id": "987",
      "type": "action.devices.types.FAN",
      "traits": [
        "action.devices.traits.OnOff",
        "action.devices.traits.FanSpeed"
      ],
      "name": {
        "defaultNames": ["MkZense Corp, 2018"],
        "name": "Fan",
        "nicknames": ["ceiling fan"]
      },
      "willReportState": false,
      "attributes": {
        "availableFanSpeeds": {
          "speeds": [{
              "speed_name": "Low",
              "speed_values": [{
                  "speed_synonym": ["low", "slow"],
                  "lang": "en"
                },
                {
                  "speed_synonym": ["low", "slow"],
                  "lang": "de"
                }
              ]
            },
            {
              "speed_name": "Medium",
              "speed_values": [{
                  "speed_synonym": ["medium"],
                  "lang": "en"
                },
                {
                  "speed_synonym": ["medium"],
                  "lang": "de"
                }
              ]
            },
            {
              "speed_name": "High",
              "speed_values": [{
                  "speed_synonym": ["high"],
                  "lang": "en"
                },
                {
                  "speed_synonym": ["high"],
                  "lang": "de"
                }
              ]
            }
          ],
          "ordered": true
        },
        "reversible": true
      },
      "deviceInfo": {
        "manufacturer": "MkZense Corp",
        "model": "492134",
        "hwVersion": "0.1",
        "swVersion": "0.1"
      },
      "customData": {
        "fooValue": 74,
        "barValue": true,
        "bazValue": "lambtwirl"
      }
    }]
  }

}
