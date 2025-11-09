// Description: Ce script supprime TOUS les utilisateurs de Firebase Authentication.
// À utiliser avec une extrême prudence et uniquement sur des environnements de développement.
//
// Prérequis:
// 1. Avoir le SDK Admin de Firebase : `npm install firebase-admin`
// 2. Avoir un fichier de clé de service : Téléchargez-le depuis la console Firebase
//    (Paramètres du projet > Comptes de service > Générer une nouvelle clé privée).
//
// Utilisation:
// node scripts/delete-auth-users.js /chemin/vers/votre/serviceAccountKey.json

const admin = require('firebase-admin');

// Vérifiez si le chemin vers le fichier de clé de service est fourni
if (process.argv.length < 3) {
    console.error('Erreur: Veuillez fournir le chemin vers votre fichier de clé de service Firebase.');
    console.log('Usage: node scripts/delete-auth-users.js <chemin/vers/serviceAccountKey.json>');
    process.exit(1);
}

const serviceAccount = require(process.argv[2]);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function deleteAllUsers(nextPageToken) {
  try {
    const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
    
    if (listUsersResult.users.length === 0) {
      console.log('Aucun utilisateur à supprimer.');
      return;
    }

    const uids = listUsersResult.users.map(userRecord => userRecord.uid);
    const deleteResult = await admin.auth().deleteUsers(uids);

    console.log(`Supprimé avec succès ${deleteResult.successCount} utilisateurs.`);
    if (deleteResult.failureCount > 0) {
        console.error(`Échec de la suppression de ${deleteResult.failureCount} utilisateurs.`);
        deleteResult.errors.forEach(error => {
            console.error(`  - UID ${error.uid}: ${error.error}`);
        });
    }

    // S'il y a d'autres pages, continuer la suppression
    if (listUsersResult.pageToken) {
      await deleteAllUsers(listUsersResult.pageToken);
    }
  } catch (error) {
    console.error('Erreur lors de la suppression des utilisateurs:', error);
  }
}

console.log('Début de la suppression de tous les utilisateurs...');
deleteAllUsers().then(() => {
    console.log('Opération terminée.');
    process.exit(0);
});
