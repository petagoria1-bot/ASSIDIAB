// Description: Ce script peuple votre base de données Firestore avec des données de test.
// Il crée un patient, un médecin, un membre de la famille et quelques entrées de journal.
//
// Prérequis:
// 1. Avoir le SDK Admin de Firebase et uuid : `npm install firebase-admin uuid`
// 2. Avoir un fichier de clé de service.
//
// Utilisation:
// node scripts/seed.js /chemin/vers/votre/serviceAccountKey.json

const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

if (process.argv.length < 3) {
    console.error('Erreur: Veuillez fournir le chemin vers votre fichier de clé de service Firebase.');
    process.exit(1);
}

const serviceAccount = require(process.argv[2]);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

const main = async () => {
    console.log('Début du seeding...');

    // --- 1. Créer les utilisateurs dans Auth ---
    console.log('Création des utilisateurs Auth...');
    const patientUser = await auth.createUser({ email: 'patient@test.com', password: 'password', displayName: 'Léo Martin' });
    const familleUser = await auth.createUser({ email: 'famille@test.com', password: 'password', displayName: 'Alice Martin' });
    const medecinUser = await auth.createUser({ email: 'medecin@test.com', password: 'password', displayName: 'Dr. Dubois' });
    
    // Les documents /users sont créés automatiquement par la Cloud Function onAuthUserCreate
    console.log('Utilisateurs Auth créés. Attente de la création des profils Firestore par la fonction (5s)...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // --- 2. Mettre à jour les rôles des utilisateurs ---
    console.log('Mise à jour des rôles...');
    await db.collection('users').doc(patientUser.uid).update({ role: 'patient' });
    await db.collection('users').doc(familleUser.uid).update({ role: 'famille' });
    await db.collection('users').doc(medecinUser.uid).update({ role: 'medecin' });

    // --- 3. Créer le profil patient complet ---
    console.log('Création du profil patient...');
    const patientId = patientUser.uid;
    const patientRef = db.collection('patients').doc(patientId);
    await patientRef.set({
        userUid: patientId,
        prenom: 'Léo',
        nom: 'Martin',
        naissance: '2015-06-15',
        cibles: { gly_min: 0.80, gly_max: 1.60, unit: "gL" },
        ratios: { petit_dej: 10, dejeuner: 12, gouter: 15, diner: 11 },
        corrections: [
            { max: 1.60, addU: 0 },
            { max: 2.00, addU: 1 },
            { max: 3.00, addU: 2 },
            { max: Infinity, addU: 3 },
        ],
        maxBolus: 15,
        correctionDelayHours: 3,
        contacts: [{ id: uuidv4(), lien: 'Maman', nom: 'Alice Martin', tel: '0612345678' }],
        notes_pai: "Attention aux activités sportives non planifiées.",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // --- 4. Créer des entrées de journal pour le patient ---
    console.log('Création des entrées de journal...');
    const entriesBatch = db.batch();
    const today = new Date().toISOString().split('T')[0];

    // Mesure de glycémie
    const ts1 = new Date(); ts1.setHours(8, 5);
    entriesBatch.set(db.collection('entries').doc(), {
        uid: patientId, dayId: today, type: 'glucose', ts: ts1.toISOString(), value: 1.15, unit: 'gL', meta: { source: 'capteur' }
    });

    // Repas
    const ts2 = new Date(); ts2.setHours(12, 30);
     entriesBatch.set(db.collection('entries').doc(), {
        uid: patientId, dayId: today, type: 'meal', ts: ts2.toISOString(), value: 60, unit: 'g', meta: { moment: 'dejeuner', items: [{ nom: 'Pâtes', carbs_g: 60 }] }
    });
    
    // Bolus
    const ts3 = new Date(); ts3.setHours(12, 31);
     entriesBatch.set(db.collection('entries').doc(), {
        uid: patientId, dayId: today, type: 'bolus', ts: ts3.toISOString(), value: 5.0, unit: 'U', meta: { subType: 'rapide', calc_details: 'Repas: 5.0U, Corr: 0U' }
    });

    await entriesBatch.commit();

    console.log('Seeding terminé avec succès !');
};

main().catch(console.error);