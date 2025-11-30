import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

// Send notification helper
const sendNotification = async (userId: string, title: string, body: string) => {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    if (userData?.fcmToken) {
      await messaging.send({
        token: userData.fcmToken,
        notification: {
          title,
          body,
        },
        webpush: {
          fcmOptions: {
            link: '/',
          },
        },
      });
      console.log(`Notification sent to ${userId}`);
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

// No-show 자동 처리
export const processNoShows = functions.pubsub.schedule('every 10 minutes').onRun(async (context: functions.EventContext) => {
  const now = new Date();
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

  const reservationsRef = db.collection('reservations');
  const snapshot = await reservationsRef
    .where('status', '==', 'approved')
    .where('startTime', '<=', tenMinutesAgo.toISOString())
    .get();

  const batch = db.batch();
  snapshot.docs.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
    batch.update(doc.ref, { status: 'no_show' });
  });

  await batch.commit();
  console.log(`Processed ${snapshot.size} no-shows`);
});

// 체크인 리마인더 (30분 전)
export const sendCheckInReminders = functions.pubsub.schedule('every 5 minutes').onRun(async (context: functions.EventContext) => {
  const now = new Date();
  const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);

  const reservationsRef = db.collection('reservations');
  const snapshot = await reservationsRef
    .where('status', '==', 'approved')
    .where('startTime', '>=', now.toISOString())
    .where('startTime', '<=', thirtyMinutesFromNow.toISOString())
    .get();

  const promises = snapshot.docs.map(async (doc: admin.firestore.QueryDocumentSnapshot) => {
    const reservation = doc.data();
    // Check if reminder already sent (you might want to add a field for this)
    const reminderSent = reservation.reminderSent;
    if (!reminderSent) {
      await sendNotification(reservation.userId, '체크인 리마인더', '예약 시작 30분 전입니다. QR 코드를 준비하세요.');
      // Mark reminder as sent
      await doc.ref.update({ reminderSent: true });
    }
  });

  await Promise.all(promises);
  console.log(`Sent reminders for ${snapshot.size} reservations`);
});

// 대기자 자동 승급
export const promoteWaitlist = functions.firestore
  .document('reservations/{reservationId}')
  .onUpdate(async (change: functions.Change<admin.firestore.DocumentSnapshot>, context: functions.EventContext) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before?.status !== 'approved' && after?.status === 'approved') {
      // Send notification to user
      await sendNotification(after.userId, '예약 승인', '예약이 승인되었습니다. QR 코드를 확인하세요.');

      // Reservation was approved, check if there's a waitlist
      const waitlistRef = db.collection('waitlists');
      const waitlistSnapshot = await waitlistRef
        .where('spaceId', '==', after.spaceId)
        .orderBy('createdAt')
        .limit(1)
        .get();

      if (!waitlistSnapshot.empty) {
        const waitlistDoc = waitlistSnapshot.docs[0];
        const waitlistData = waitlistDoc.data();

        // Create new reservation for waitlist user
        await db.collection('reservations').add({
          spaceId: waitlistData.spaceId,
          userId: waitlistData.userId,
          startTime: after.startTime,
          endTime: after.endTime,
          status: 'approved',
          createdAt: new Date().toISOString(),
        });

        // Send notification to promoted user
        await sendNotification(waitlistData.userId, '대기자 승급', '대기 중이던 예약이 확정되었습니다.');

        // Remove from waitlist
        await waitlistDoc.ref.delete();

        console.log(`Promoted user ${waitlistData.userId} from waitlist`);
      }
    } else if (before?.status !== 'rejected' && after?.status === 'rejected') {
      // Send rejection notification
      await sendNotification(after.userId, '예약 반려', '예약이 반려되었습니다. 다른 시간대를 확인해주세요.');
    }
  });

// 통계 업데이트
export const updateStats = functions.firestore
  .document('reservations/{reservationId}')
  .onWrite(async (change: functions.Change<admin.firestore.DocumentSnapshot>, context: functions.EventContext) => {
    const reservation = change.after.exists ? change.after.data() : null;
    if (!reservation) return;

    const date = new Date(reservation.startTime).toISOString().split('T')[0];
    const statsRef = db.collection('stats').doc(date);

    const statsDoc = await statsRef.get();
    const currentStats = statsDoc.exists ? statsDoc.data() : {
      programId: reservation.spaceId,
      reservationCount: 0,
      checkInCount: 0,
      noShowCount: 0,
      averageRating: 0,
    };

    if (reservation.status === 'checked_in') {
      currentStats.checkInCount += 1;
    } else if (reservation.status === 'no_show') {
      currentStats.noShowCount += 1;
    }

    await statsRef.set(currentStats);
  });

// 피드백 제출 제한 (한 번만)
export const submitFeedback = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { programId, rating, comment } = data;
  const userId = context.auth.uid;

  // Check if user already submitted feedback
  const feedbackRef = db.collection('feedback');
  const existingFeedback = await feedbackRef
    .where('programId', '==', programId)
    .where('userId', '==', userId)
    .get();

  if (!existingFeedback.empty) {
    throw new functions.https.HttpsError('already-exists', 'Feedback already submitted');
  }

  await feedbackRef.add({
    programId,
    userId,
    rating,
    comment,
    createdAt: new Date().toISOString(),
  });

  return { success: true };
});