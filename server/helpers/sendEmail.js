const { AWSSES, sender_email } = require('../config/awsses');

const sendEmail = async (to, subject, htmlContent) => {
  const params = {
    Source: sender_email,
    Destination: {
      ToAddresses: [to]
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8'
      },
      Body: {
        Html: {
          Data: htmlContent,
          Charset: 'UTF-8'
        }
      }
    }
  };

  try {
    const result = await AWSSES.sendEmail(params).promise();
    console.log('Email sent:', result.MessageId);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = sendEmail;