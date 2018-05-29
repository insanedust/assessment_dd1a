var ActiveDirectory = require('activedirectory');
var config = {
    url: 'ldap://localhost',
    baseDN: 'dc=weliketoeat,dc=co,dc=za'
};

module.exports = new ActiveDirectory(config);

