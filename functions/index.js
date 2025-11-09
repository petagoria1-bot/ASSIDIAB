const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

/**
 * Triggered on new user creation in Firebase Auth.
 * Creates a corresponding user document in Firestore with a default "undetermined" role.
 */
exports.onAuthUserCreate = functions.region("europe-west1").auth.user().onCreate(async (user) => {
  const { uid, email, displayName } = user;
  
  let prenom = "";
  let nom = "";
  if (displayName) {
    const nameParts = displayName.split(" ");
    prenom = nameParts[0] || "";
    nom = nameParts.slice(1).join(" ") || "";
  }
  
  const userRef = db.collection("users").doc(uid);
  
  functions.logger.log(`Creating user profile for UID: ${uid}`);

  return userRef.set({
    uid,
    email,
    prenom,
    nom,
    role: "undetermined",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastSeen: admin.firestore.FieldValue.serverTimestamp(),
  });
});

/**
 * Callable HTTPS function to create an invitation.
 * Verifies that the caller is the patient themselves.
 */
exports.createInvitation = functions.region("europe-west1").https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Vous devez être connecté pour inviter un membre.");
  }
  
  const { email, role, rights } = data;
  const patientId = context.auth.uid;

  const userQuery = await db.collection("users").where("email", "==", email).limit(1).get();
  if (userQuery.empty) {
    throw new functions.https.HttpsError("not-found", "Aucun utilisateur trouvé avec cet email.");
  }
  const memberUser = userQuery.docs[0].data();
  const memberUid = memberUser.uid;

  if (patientId === memberUid) {
    throw new functions.https.HttpsError("invalid-argument", "Vous ne pouvez pas vous inviter vous-même.");
  }
  
  const patientDoc = await db.collection("patients").doc(patientId).get();
  if (!patientDoc.exists) {
      throw new functions.https.HttpsError("failed-precondition", "Profil patient non trouvé. Vous devez d'abord créer votre profil.");
  }
  const patientData = patientDoc.data();

  const memberRef = db.collection("patients").doc(patientId).collection("circleMembers").doc(memberUid);
  const existingDoc = await memberRef.get();
  if (existingDoc.exists()) {
    throw new functions.https.HttpsError("already-exists", "Cette personne est déjà dans votre cercle ou a une invitation en attente.");
  }

  const invitationRef = db.collection("invitations").doc();

  const newCircleMemberData = {
    patientId,
    patientName: `${patientData.prenom} ${patientData.nom}`,
    memberUserId: memberUid,
    memberEmail: email,
    role,
    rights,
    status: "pending",
    invitedAt: admin.firestore.FieldValue.serverTimestamp(),
    invitationId: invitationRef.id,
  };

  const batch = db.batch();
  batch.set(memberRef, newCircleMemberData);
  batch.set(invitationRef, { ...newCircleMemberData, memberDocPath: memberRef.path });

  await batch.commit();
  
  const finalData = { ...newCircleMemberData, id: memberRef.id };
  return { success: true, invitationId: invitationRef.id, memberData: finalData };
});

/**
 * Callable HTTPS function to respond to an invitation.
 */
exports.respondToInvitation = functions.region("europe-west1").https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Vous devez être connecté pour répondre.");
    }
    
    const { invitationId, status } = data; // status: 'accepted' | 'refused'
    const memberUid = context.auth.uid;

    const invitationRef = db.collection("invitations").doc(invitationId);
    const invitationDoc = await invitationRef.get();

    if (!invitationDoc.exists || invitationDoc.data().memberUserId !== memberUid) {
        throw new functions.https.HttpsError("not-found", "Invitation non valide ou non trouvée.");
    }

    const { memberDocPath } = invitationDoc.data();
    const memberRef = db.doc(memberDocPath);

    const batch = db.batch();
    batch.update(memberRef, { status, respondedAt: admin.firestore.FieldValue.serverTimestamp() });
    batch.delete(invitationDoc.ref);
    await batch.commit();

    return { success: true, status };
});

/**
 * Callable HTTPS function to get public details of an invitation.
 * Allows a non-authenticated user to see who invited them.
 */
exports.getPublicInvitationDetails = functions.region("europe-west1").https.onCall(async (data) => {
    const { invitationId } = data;
    if (!invitationId) {
        throw new functions.https.HttpsError("invalid-argument", "L'ID de l'invitation est manquant.");
    }

    const invitationRef = db.collection("invitations").doc(invitationId);
    const invitationDoc = await invitationRef.get();

    if (!invitationDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Invitation non valide ou expirée.");
    }

    const { patientName, role, memberEmail } = invitationDoc.data();
    return { patientName, role, email: memberEmail };
});


/**
 * Callable HTTPS function for caregivers to securely fetch a patient's journal entries.
 */
exports.getEntriesForPatient = functions.region("europe-west1").https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Authentification requise.");
  }
  
  const { patientId, limit: queryLimit = 100 } = data;
  const memberId = context.auth.uid;

  if (!patientId) {
    throw new functions.https.HttpsError("invalid-argument", "L'ID du patient est manquant.");
  }

  // Security Check: Verify the caller is an accepted member with read rights.
  const memberRef = db.collection("patients").doc(patientId).collection("circleMembers").doc(memberId);
  const memberDoc = await memberRef.get();

  if (!memberDoc.exists) {
    throw new functions.https.HttpsError("permission-denied", "Vous ne faites pas partie du cercle de soins de ce patient.");
  }
  
  const memberData = memberDoc.data();
  if (memberData.status !== "accepted" || memberData.rights.read !== true) {
      throw new functions.https.HttpsError("permission-denied", "Vous n'avez pas les droits de lecture pour ce patient.");
  }

  // If security check passes, fetch the entries.
  const entriesQuery = db.collection("entries")
    .where("uid", "==", patientId)
    .orderBy("ts", "desc")
    .limit(queryLimit);
    
  const entriesSnap = await entriesQuery.get();
  const entries = entriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return entries;
});


// Placeholder for dailySummary function
exports.dailySummary = functions.region("europe-west1").https.onCall(async (data, context) => {
    functions.logger.info("dailySummary called with:", data);
    // In a real implementation:
    // 1. Verify user authentication and permissions.
    // 2. Query 'entries' collection for the given patient and dayId.
    // 3. Perform calculations (avg, TIR, hypos, hypers).
    // 4. Return the summary object.
    return { data: { count: 0, avg: 0, tir: 0, hypo: 0, hyper: 0, message: "Fonction non implémentée." }};
});

// Placeholder for exportPdf function
exports.exportPdf = functions.region("europe-west1").https.onCall(async (data, context) => {
    functions.logger.info("exportPdf called with:", data);
    // In a real implementation:
    // 1. Verify user authentication and permissions.
    // 2. Query data for the given patient and date range.
    // 3. Use a library like PDFKit or Puppeteer to generate a PDF.
    // 4. Upload the PDF to Firebase Storage in a secure location.
    // 5. Return the path to the file in Storage.
    return { data: { path: "reports/placeholder.pdf", message: "Fonction non implémentée." } };
});