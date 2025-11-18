import admin from 'firebase-admin';

let app: admin.app.App;

export async function initAdmin() {
  if (!admin.apps.length) {
    app = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } else {
    app = admin.app();
  }
  return app;
}