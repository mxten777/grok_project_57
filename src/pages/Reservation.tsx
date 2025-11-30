import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';

interface Space {
  id: string;
  name: string;
  type: 'program' | 'room' | 'studyroom';
  capacity: number;
  description: string;
  location: string;
  imageUrl: string;
}

const Reservation = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const { user } = useAuth();
  const [space, setSpace] = useState<Space | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [peopleCount, setPeopleCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    const fetchSpace = async () => {
      if (!spaceId) return;
      const docRef = doc(db, 'spaces', spaceId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSpace({ id: docSnap.id, ...docSnap.data() } as Space);
      }
    };
    fetchSpace();
  }, [spaceId]);

  const generateQRCode = async (id: string) => {
    try {
      const url = await QRCode.toDataURL(id);
      setQrCodeUrl(url);
    } catch (error) {
      console.error('QR Code generation error:', error);
    }
  };

  const handleReservation = async () => {
    if (!user || !space || !selectedDate || !selectedTime) return;

    setLoading(true);
    try {
      // Check current reservations
      const startTime = new Date(`${selectedDate}T${selectedTime}`);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour

      const q = query(
        collection(db, 'reservations'),
        where('spaceId', '==', spaceId),
        where('startTime', '==', startTime.toISOString()),
        where('status', 'in', ['pending', 'approved', 'checked_in'])
      );
      const querySnapshot = await getDocs(q);
      const currentReservations = querySnapshot.size;

      let status: string;
      if (currentReservations >= space.capacity) {
        // Add to waitlist
        await addDoc(collection(db, 'waitlists'), {
          spaceId,
          userId: user.uid,
          position: currentReservations - space.capacity + 1,
          createdAt: new Date().toISOString(),
        });
        alert('정원이 초과되어 대기자 명단에 등록되었습니다.');
      } else {
        // Create reservation
        status = 'pending';
        const docRef = await addDoc(collection(db, 'reservations'), {
          spaceId,
          userId: user.uid,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          status,
          createdAt: new Date().toISOString(),
        });
        setReservationId(docRef.id);
        await generateQRCode(docRef.id);
        alert('예약 신청이 완료되었습니다. QR 코드를 저장하세요.');
      }
    } catch (error) {
      console.error('Reservation error:', error);
      alert('예약 중 오류가 발생했습니다.');
    }
    setLoading(false);
  };

  if (!space) return <div>Loading...</div>;

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-8">{space.name} 예약</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        {!reservationId ? (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">날짜 선택</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">시간 선택</label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">시간 선택</option>
                <option value="09:00">09:00</option>
                <option value="10:00">10:00</option>
                <option value="11:00">11:00</option>
                <option value="14:00">14:00</option>
                <option value="15:00">15:00</option>
                <option value="16:00">16:00</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">인원 수</label>
              <input
                type="number"
                min="1"
                max={space.capacity}
                value={peopleCount}
                onChange={(e) => setPeopleCount(parseInt(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
            <button
              onClick={handleReservation}
              disabled={loading || !selectedDate || !selectedTime}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? '예약 중...' : '예약 신청'}
            </button>
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">예약 완료!</h2>
            <p className="mb-4">체크인 시 사용할 QR 코드를 저장하세요.</p>
            {qrCodeUrl && (
              <div className="mb-4">
                <img src={qrCodeUrl} alt="QR Code" className="mx-auto" />
              </div>
            )}
            <p className="text-sm text-gray-600">예약 ID: {reservationId}</p>
            <button
              onClick={() => window.print()}
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              QR 코드 인쇄
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Reservation;