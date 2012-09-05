# CAS auth prototype

##install dependensies 

Install node.js  http://nodejs.org/download/
Ensure that test CAS server is configured and runned on localhost with ssl support 
(typical url is https://localhost:8443/cas/login)

##configure application
edit casproto/config.js
  
##checkout,install packages, run

    git clone git@github.com:buhuru/express-cas-proto.git
    cd express-cas-proto
    npm install
    node app.js

##test it
  http://localhost:3000/