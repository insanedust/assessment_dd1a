var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'afrihost',
  host: 'unohana.aserv.co.za',
  port: 465,
  secure: true,
  auth: {
    user: 'admin@weliketoeat.co.za',
    pass: 'Adm1nP@55w0rd'
  }
});


module.exports = transporter;