var admin = require("firebase-admin");
var serviceAccount = require('./admin.json');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
initializeApp({
    credential: cert(serviceAccount)
  });
  
  const db = getFirestore();