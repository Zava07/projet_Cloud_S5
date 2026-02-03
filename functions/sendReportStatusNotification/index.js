const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.onReportStatusChange = functions.firestore
  .document('reports/{reportId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (!before || !after) return null;
    if (before.status === after.status) return null; // nothing changed

    // find owner
    const userId = after.userId;
    if (!userId) return null;

    // get user tokens
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) return null;

    const userData = userDoc.data();
    const tokens = userData?.fcmTokens || [];
    if (!tokens.length) return null;

    const payload = {
      notification: {
        title: 'Mise à jour de votre signalement',
        body: `Le statut de votre signalement a été modifié : ${after.status}`,
      },
      data: {
        reportId: context.params.reportId,
        status: after.status,
      }
    };

    try {
      const response = await admin.messaging().sendToDevice(tokens, payload);
      console.log('Notifications envoyées:', response);
    } catch (err) {
      console.error('Erreur en envoyant notification:', err);
    }
    return null;
  });