import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getFunctions, provideFunctions } from '@angular/fire/functions';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp({
        projectId: "first-contact-chcc",
        appId: "1:316554060244:web:0218a72e8cbc941ce2b641",
        storageBucket: "first-contact-chcc.firebasestorage.app",
        apiKey: "AIzaSyB5C05rCIJQ0LKMVkSRYEqW2TUSj-LLSxU",
        authDomain: "first-contact-chcc.firebaseapp.com",
        messagingSenderId: "316554060244",
        measurementId: "G-H3VY723M4N",
        // projectNumber: "316554060244",
        // version: "2"
      })),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => getFunctions())
  ]
};
