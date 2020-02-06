#!/bin/bash

printf "Installing Dependencies"
sudo apt-get update -y
sudo apt-get upgrade -y

curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y \
    python3         \
    python3-pip     \
    python3-venv    \
    zip             \
    unzip           \
    nodejs          \
    npm

cd server

printf "Initializing Virtual Environment\n\n"
python3 -m venv venv
source venv/bin/activate

printf "Installing Requirements\n\n"
pip3 install -r requirements.txt

IP=$(ip addr | grep 'state UP' -A2 | tail -n1 | awk '{print $2}' | cut -f1  -d'/')
printf "IP: $IP"
printf "\nInstalling NodeJS  packages ... "
cd static/javascript/reactjs
npm install

printf "\n\nSetting IP"
echo "const ip = '$IP'; module.exports = ip" > src/config.js

printf "\nUpdating react"
npm run wp:build


printf "\n\nSETUP COMPLETED\n\n"
