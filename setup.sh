CUR=$(pwd)
# update and upgrade
sudo apt-get update && sudo apt-get upgrade -y

# building scripts
cp config.js server/static/javascript/reactjs/src/config
cd server/static/javascript/reactjs
npm install
npm run wp:build

cd $CUR
docker build --tag axiiom/fileserver .
