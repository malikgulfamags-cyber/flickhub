const AWS = require('aws-sdk');
require('dotenv').config();

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION;
const AWS_VERSION = '2010-12-12';

const awsConfig = {
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
  apiVersion: AWS_VERSION
};

const sender_email = "Flick Hub <malikgulfamags@gmail.com>";

const AWSSES = new AWS.SES(awsConfig);

module.exports = { sender_email, AWSSES };