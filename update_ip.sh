IP=$(ip addr | grep 'state UP' -A2 | tail -n1 | awk '{print $2}' | cut -f1  -d'/')
printf "IP: $IP"

printf "\nUpdating packages ... "
cd /fileserver/static/javascript/reactjs
npm install

printf "\n\nSetting IP"
echo "const ip = '$IP'; module.exports = ip" > src/config.js

printf "\nUpdating react"
npm run wp:build
