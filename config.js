exports.config = {
    cas:{
        service:'http://localhost:3000/cas/login', // CAS will redirect to this page if login successful
        host: 'localhost',
        port: '8443',
    	protocol : 'https'
    },
    resturl:'http://localhost:3030/rest/gettestdata?f=json'
};