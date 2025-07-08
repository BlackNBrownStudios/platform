const fs = require('fs');
const path = require('path');
const https = require('https');
const logger = require('./logger');

// Path to store the CA certificate
const CA_CERT_PATH = path.join(__dirname, '../../rds-ca-2019-root.pem');

/**
 * Downloads the Amazon RDS CA certificate if not already present
 * @returns {Promise<string>} Path to the CA certificate
 */
const downloadCertificate = () => {
  return new Promise((resolve, reject) => {
    // If certificate already exists, return its path
    if (fs.existsSync(CA_CERT_PATH)) {
      logger.info('Using existing AWS RDS CA certificate');
      return resolve(CA_CERT_PATH);
    }

    logger.info('Downloading AWS RDS CA certificate...');
    
    const certUrl = 'https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem';
    const file = fs.createWriteStream(CA_CERT_PATH);
    
    https.get(certUrl, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download certificate: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        logger.info('AWS RDS CA certificate downloaded successfully');
        resolve(CA_CERT_PATH);
      });
    }).on('error', (err) => {
      fs.unlink(CA_CERT_PATH, () => {}); // Delete the file if download failed
      reject(err);
    });
  });
};

/**
 * Gets MongoDB connection options for AWS DocumentDB
 * @returns {Promise<Object>} MongoDB connection options
 */
const getDocumentDBOptions = async () => {
  try {
    const caFilePath = await downloadCertificate();
    
    return {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true,
      sslValidate: true,
      sslCA: fs.readFileSync(caFilePath),
      retryWrites: false // DocumentDB doesn't support retryWrites
    };
  } catch (error) {
    logger.error('Error setting up DocumentDB options:', error);
    // Fallback options with TLS verification disabled (for development/testing only)
    return {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true,
      sslValidate: false,
      retryWrites: false
    };
  }
};

module.exports = {
  downloadCertificate,
  getDocumentDBOptions
};
