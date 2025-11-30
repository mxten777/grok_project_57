import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { CalendarIcon, Clock, Users } from 'lucide-react';

interface Reservation {
  id: string;
  spaceId: string;
  userId: string;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
}

interface Space {
  id: string;
  name: string;
  type: string;
  capacity: number;
  description: string;
}

export default function CalendarView() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch reservations
      const reservationsSnapshot = await getDocs(collection(db, 'reservations'));
      const reservationsData = reservationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reservation[];

      // Fetch spaces
      const spacesSnapshot = await getDocs(collection(db, 'spaces'));
      const spacesData = spacesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Space[];

      // If no data in Firestore, use sample data
      if (spacesData.length === 0) {
        setSpaces([
          {
            id: 'sample1',
            name: '프로그래밍 워크숍',
            type: 'program',
            capacity: 20,
            description: '초보자를 위한 프로그래밍 워크숍'
          },
          {
            id: 'sample2',
            name: '스터디룸 101',
            type: 'studyroom',
            capacity: 4,
            description: '개인 스터디용 룸'
          },
          {
            id: 'sample3',
            name: '강의실 B',
            type: 'room',
            capacity: 30,
            description: '소규모 강의용 강의실'
          }
        ]);
      } else {
        setSpaces(spacesData);
      }

      setReservations(reservationsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReservationsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return reservations.filter(reservation => {
      const reservationDate = new Date(reservation.startTime).toISOString().split('T')[0];
      return reservationDate === dateStr && reservation.status === 'approved';
    });
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dayReservations = getReservationsForDate(date);
      if (dayReservations.length > 0) {
        return (
          <div className="flex justify-center mt-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
        );
      }
    }
    return null;
  };

  const selectedDateReservations = selectedDate ? getReservationsForDate(selectedDate) : [];

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
            <CalendarIcon className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">예약 캘린더</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calendar */}
            <div>
              <h2 className="text-xl font-semibold mb-4">날짜 선택</h2>
              <Calendar
                onChange={(value) => {
                  if (value instanceof Date) {
                    setSelectedDate(value);
                  }
                }}
                value={selectedDate}
                tileContent={tileContent}
                className="w-full border-none shadow-sm rounded-lg"
              />
            </div>

            {/* Reservations for selected date */}
            <div>
              <h2 className="text-xl font-semibold mb-4">
                {selectedDate ? selectedDate.toLocaleDateString('ko-KR') : '날짜를 선택하세요'} 예약 현황
              </h2>
              {selectedDateReservations.length === 0 ? (
                <p className="text-gray-500">이 날짜에 예약된 공간이 없습니다.</p>
              ) : (
                <div className="space-y-4">
                  {selectedDateReservations.map((reservation) => {
                    const space = spaces.find(s => s.id === reservation.spaceId);
                    return (
                      <motion.div
                        key={reservation.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {space?.name || '알 수 없는 공간'}
                            </h3>
                            <p className="text-sm text-gray-600">{space?.type}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-4 w-4 mr-1" />
                              {new Date(reservation.startTime).toLocaleTimeString('ko-KR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })} - {new Date(reservation.endTime).toLocaleTimeString('ko-KR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <Users className="h-4 w-4 mr-1" />
                              최대 {space?.capacity}명
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}