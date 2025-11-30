import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, MapPin, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface Reservation {
  id: string;
  spaceId: string;
  userId: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'checked_in' | 'no_show';
  createdAt: string;
}

interface Space {
  id: string;
  name: string;
  type: string;
  capacity: number;
  description: string;
  location: string;
}

export default function MyReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReservation, setEditingReservation] = useState<string | null>(null);
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch user's reservations
      const reservationsRef = collection(db, 'reservations');
      const reservationsSnapshot = await getDocs(reservationsRef);
      const userReservations = reservationsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Reservation))
        .filter(reservation => reservation.userId === user?.uid);

      // Fetch spaces
      const spacesRef = collection(db, 'spaces');
      const spacesSnapshot = await getDocs(spacesRef);
      const spacesData = spacesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Space));

      // If no spaces in Firestore, use sample data
      if (spacesData.length === 0) {
        setSpaces([
          { id: 'sample1', name: '프로그래밍 워크숍', type: 'program', capacity: 20, description: '초보자를 위한 프로그래밍 워크숍', location: '세미나실 A' },
          { id: 'sample2', name: '스터디룸 101', type: 'studyroom', capacity: 4, description: '개인 스터디용 룸', location: '2층' },
          { id: 'sample3', name: '강의실 B', type: 'room', capacity: 30, description: '소규모 강의용 강의실', location: '1층' }
        ]);
      } else {
        setSpaces(spacesData);
      }

      setReservations(userReservations);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    if (window.confirm('예약을 취소하시겠습니까?')) {
      try {
        await updateDoc(doc(db, 'reservations', reservationId), {
          status: 'cancelled'
        });
        setReservations(reservations.map(res =>
          res.id === reservationId ? { ...res, status: 'cancelled' } : res
        ));
        alert('예약이 취소되었습니다.');
      } catch (error) {
        console.error('Error cancelling reservation:', error);
        alert('예약 취소에 실패했습니다.');
      }
    }
  };

  const handleEditReservation = (reservation: Reservation) => {
    setEditingReservation(reservation.id);
    setNewStartTime(reservation.startTime);
    setNewEndTime(reservation.endTime);
  };

  const handleSaveEdit = async (reservationId: string) => {
    try {
      await updateDoc(doc(db, 'reservations', reservationId), {
        startTime: newStartTime,
        endTime: newEndTime
      });
      setReservations(reservations.map(res =>
        res.id === reservationId ? { ...res, startTime: newStartTime, endTime: newEndTime } : res
      ));
      setEditingReservation(null);
      alert('예약이 수정되었습니다.');
    } catch (error) {
      console.error('Error updating reservation:', error);
      alert('예약 수정에 실패했습니다.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'checked_in': return 'bg-blue-100 text-blue-800';
      case 'no_show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return '승인됨';
      case 'pending': return '대기중';
      case 'rejected': return '반려됨';
      case 'cancelled': return '취소됨';
      case 'checked_in': return '체크인됨';
      case 'no_show': return '노쇼';
      default: return status;
    }
  };

  const canEdit = (reservation: Reservation) => {
    return reservation.status === 'pending' || reservation.status === 'approved';
  };

  const canCancel = (reservation: Reservation) => {
    return reservation.status === 'pending' || reservation.status === 'approved';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center mb-6">
            <Calendar className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">내 예약</h1>
          </div>

          {reservations.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">예약 내역이 없습니다</h3>
              <p className="text-gray-500">새로운 예약을 만들어보세요.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reservations.map((reservation) => {
                const space = spaces.find(s => s.id === reservation.spaceId);
                return (
                  <motion.div
                    key={reservation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gray-50 rounded-lg p-6 border-l-4 border-blue-500"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {space?.name || '알 수 없는 공간'}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
                            {getStatusText(reservation.status)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            위치: {space?.location}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 mr-2" />
                            정원: {space?.capacity}명
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            시작: {new Date(reservation.startTime).toLocaleString('ko-KR')}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            종료: {new Date(reservation.endTime).toLocaleString('ko-KR')}
                          </div>
                        </div>

                        {editingReservation === reservation.id && (
                          <div className="bg-white p-4 rounded-lg border mb-4">
                            <h4 className="font-medium mb-3">예약 시간 수정</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  시작 시간
                                </label>
                                <input
                                  type="datetime-local"
                                  value={newStartTime}
                                  onChange={(e) => setNewStartTime(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  종료 시간
                                </label>
                                <input
                                  type="datetime-local"
                                  value={newEndTime}
                                  onChange={(e) => setNewEndTime(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <button
                                onClick={() => handleSaveEdit(reservation.id)}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                              >
                                저장
                              </button>
                              <button
                                onClick={() => setEditingReservation(null)}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                              >
                                취소
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4 lg:mt-0">
                        {canEdit(reservation) && (
                          <button
                            onClick={() => handleEditReservation(reservation)}
                            className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                          >
                            <Edit className="h-4 w-4" />
                            수정
                          </button>
                        )}
                        {canCancel(reservation) && (
                          <button
                            onClick={() => handleCancelReservation(reservation.id)}
                            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                            취소
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}