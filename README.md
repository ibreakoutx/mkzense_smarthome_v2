# mkzense_smarthome_v2
# To start secure SSL server
MKZENSE_ENABLE_SSL=true node app.js
or use script
./start_ssl_server.sh

To start forever daemon with SSL
sudo su root
export MKZENSE_ENABLE_SSL=true
forever start app.js

