import { useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import Feedback from '../components/Feedback';

const CheckIn = () => {
  const [scanResult, setScanResult] = useState('');
  const [scanning, setScanning] = useState(false);
  const [checkedInReservation, setCheckedInReservation] = useState<any>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const startScanning = async () => {
    // Check camera permission
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
      } catch (error) {
        alert('카메라 권한이 필요합니다. 브라우저 설정에서 카메라 권한을 허용해주세요.');
        return;
      }
    }

    setScanning(true);
    scannerRef.current = new Html5QrcodeScanner(
      'reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );
    scannerRef.current.render(onScanSuccess, onScanFailure);
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
    }
    setScanning(false);
  };

  const onScanSuccess = async (decodedText: string) => {
    setScanResult(decodedText);
    stopScanning();

    try {
      const reservationId = decodedText;
      const reservationRef = doc(db, 'reservations', reservationId);
      const reservationSnap = await getDoc(reservationRef);

      if (reservationSnap.exists()) {
        const reservation = reservationSnap.data();
        const startTime = new Date(reservation.startTime);
        const now = new Date();

        if (now <= new Date(startTime.getTime() + 10 * 60 * 1000)) {
          await updateDoc(reservationRef, {
            status: 'checked_in',
            checkInTime: now.toISOString(),
          });
          setCheckedInReservation({ id: reservationId, ...reservation });
          alert('체크인 완료되었습니다.');
        } else {
          await updateDoc(reservationRef, {
            status: 'no_show',
          });
          alert('체크인 시간이 지났습니다. No-show 처리되었습니다.');
        }
      } else {
        alert('유효하지 않은 QR 코드입니다.');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      alert('체크인 중 오류가 발생했습니다.');
    }
  };

  const onScanFailure = (error: any) => {
    console.warn(`QR code scan error: ${error}`);
  };

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-8">QR 체크인</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        {checkedInReservation ? (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">체크인 완료!</h2>
            <p className="mb-4">프로그램에 참여해 주셔서 감사합니다.</p>
            <Feedback programId={checkedInReservation.spaceId} onSubmit={() => {}} />
          </div>
        ) : !scanning ? (
          <button
            onClick={startScanning}
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          >
            QR 코드 스캔 시작
          </button>
        ) : (
          <div>
            <div id="reader" className="mb-4"></div>
            <button
              onClick={stopScanning}
              className="w-full bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
            >
              스캔 중지
            </button>
          </div>
        )}
        {scanResult && !checkedInReservation && (
          <p className="mt-4 text-sm text-gray-600">스캔 결과: {scanResult}</p>
        )}
      </div>
    </motion.div>
  );
};

export default CheckIn;