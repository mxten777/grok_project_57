import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, LineChart, Line, AreaChart, Area, ResponsiveContainer } from 'recharts';

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
  type: 'program' | 'room' | 'studyroom';
  capacity: number;
  description: string;
  location: string;
  imageUrl: string;
}

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [activeTab, setActiveTab] = useState('reservations');
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    if (!isAdmin) return;

    const fetchData = async () => {
      // Fetch reservations
      const reservationsSnapshot = await getDocs(collection(db, 'reservations'));
      const reservationsData = reservationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reservation));
      setReservations(reservationsData);

      // Fetch spaces
      const spacesSnapshot = await getDocs(collection(db, 'spaces'));
      const spacesData = spacesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Space));
      setSpaces(spacesData);

      // Calculate detailed stats
      const totalReservations = reservationsData.length;
      const approvedCount = reservationsData.filter(r => r.status === 'approved').length;
      const pendingCount = reservationsData.filter(r => r.status === 'pending').length;
      const rejectedCount = reservationsData.filter(r => r.status === 'rejected').length;
      const cancelledCount = reservationsData.filter(r => r.status === 'cancelled').length;
      const checkedInCount = reservationsData.filter(r => r.status === 'checked_in').length;
      const noShowCount = reservationsData.filter(r => r.status === 'no_show').length;

      // Daily reservations for the last 7 days
      const dailyData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayReservations = reservationsData.filter(r => 
          new Date(r.createdAt).toISOString().split('T')[0] === dateStr
        ).length;
        dailyData.push({
          date: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
          reservations: dayReservations
        });
      }

      // Space utilization
      const spaceUtilization = spacesData.map(space => {
        const spaceReservations = reservationsData.filter(r => r.spaceId === space.id);
        const approvedReservations = spaceReservations.filter(r => r.status === 'approved' || r.status === 'checked_in').length;
        return {
          name: space.name,
          utilization: spaceReservations.length > 0 ? Math.round((approvedReservations / spaceReservations.length) * 100) : 0,
          total: spaceReservations.length,
          approved: approvedReservations
        };
      });

      // Hourly distribution
      const hourlyData = [];
      for (let hour = 9; hour <= 18; hour++) {
        const hourReservations = reservationsData.filter(r => {
          const startHour = new Date(r.startTime).getHours();
          return startHour === hour;
        }).length;
        hourlyData.push({
          hour: `${hour}:00`,
          reservations: hourReservations
        });
      }

      setStats({
        totalReservations,
        approvedCount,
        pendingCount,
        rejectedCount,
        cancelledCount,
        checkedInCount,
        noShowCount,
        checkInRate: totalReservations > 0 ? (checkedInCount / totalReservations * 100).toFixed(1) : 0,
        noShowRate: totalReservations > 0 ? (noShowCount / totalReservations * 100).toFixed(1) : 0,
        cancellationRate: totalReservations > 0 ? (cancelledCount / totalReservations * 100).toFixed(1) : 0,
        dailyData,
        spaceUtilization,
        hourlyData
      });
    };

    fetchData();
  }, [isAdmin]);

  const handleApproval = async (id: string, status: string) => {
    await updateDoc(doc(db, 'reservations', id), { status });
    setReservations(reservations.map(res => res.id === id ? { ...res, status } : res));
  };

  const handleAddSpace = async () => {
    const newSpace = {
      name: '새 공간',
      type: 'room' as const,
      capacity: 10,
      description: '설명',
      location: '위치',
      imageUrl: 'https://via.placeholder.com/300x200'
    };
    try {
      const docRef = await addDoc(collection(db, 'spaces'), newSpace);
      setSpaces([...spaces, { id: docRef.id, ...newSpace }]);
    } catch (error) {
      console.error('Error adding space:', error);
    }
  };

  const filteredReservations = reservations.filter(res => {
    if (filter === 'all') return true;
    return res.status === filter;
  });

  if (!isAdmin) return <div className="container mx-auto px-4 py-8">관리자 권한이 필요합니다.</div>;

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-8">관리자 대시보드</h1>

      <div className="mb-6">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('reservations')}
            className={`px-4 py-2 rounded ${activeTab === 'reservations' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            예약 관리
          </button>
          <button
            onClick={() => setActiveTab('spaces')}
            className={`px-4 py-2 rounded ${activeTab === 'spaces' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            공간 관리
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded ${activeTab === 'stats' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            통계
          </button>
        </nav>
      </div>

      {activeTab === 'reservations' && (
        <>
          <div className="mb-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="all">전체</option>
              <option value="pending">대기</option>
              <option value="approved">승인</option>
              <option value="rejected">반려</option>
              <option value="checked_in">체크인</option>
              <option value="no_show">No-show</option>
            </select>
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">공간 ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용자 ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">시작 시간</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReservations.map((res, index) => (
                  <motion.tr
                    key={res.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">{res.spaceId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{res.userId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(res.startTime).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{res.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {res.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproval(res.id, 'approved')}
                            className="bg-green-500 text-white px-2 py-1 rounded mr-2 hover:bg-green-600 transition-colors"
                          >
                            승인
                          </button>
                          <button
                            onClick={() => handleApproval(res.id, 'rejected')}
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                          >
                            반려
                          </button>
                        </>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'spaces' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">공간 관리</h2>
          <button onClick={handleAddSpace} className="bg-blue-500 text-white px-4 py-2 rounded mb-4">
            공간 추가
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {spaces.map((space) => (
              <div key={space.id} className="border rounded p-4">
                <h3 className="font-semibold">{space.name}</h3>
                <p>타입: {space.type}</p>
                <p>정원: {space.capacity}</p>
                <p>위치: {space.location}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">주요 지표</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{stats.totalReservations}</div>
                <div className="text-sm text-gray-600">총 예약</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{stats.checkInRate}%</div>
                <div className="text-sm text-gray-600">출석률</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-3xl font-bold text-red-600">{stats.noShowRate}%</div>
                <div className="text-sm text-gray-600">노쇼율</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600">{stats.cancellationRate}%</div>
                <div className="text-sm text-gray-600">취소율</div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Daily Reservations Trend */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">일별 예약 추이 (최근 7일)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="reservations" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Reservation Status Distribution */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">예약 상태 분포</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: '승인됨', value: stats.approvedCount, fill: '#10B981' },
                      { name: '대기중', value: stats.pendingCount, fill: '#F59E0B' },
                      { name: '체크인', value: stats.checkedInCount, fill: '#3B82F6' },
                      { name: '반려됨', value: stats.rejectedCount, fill: '#EF4444' },
                      { name: '취소됨', value: stats.cancelledCount, fill: '#6B7280' },
                      { name: '노쇼', value: stats.noShowCount, fill: '#F97316' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Space Utilization */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">공간별 이용률</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.spaceUtilization}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [name === 'utilization' ? `${value}%` : value, name === 'utilization' ? '이용률' : '총 예약']} />
                  <Legend />
                  <Bar dataKey="utilization" fill="#8884d8" name="이용률 (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Hourly Distribution */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">시간대별 예약 분포</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="reservations" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Stats Table */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">상세 통계</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">지표</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">값</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">비율</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">총 예약 수</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stats.totalReservations}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">100%</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">승인된 예약</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stats.approvedCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stats.totalReservations > 0 ? ((stats.approvedCount / stats.totalReservations) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">체크인 완료</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stats.checkedInCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stats.checkInRate}%</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">노쇼</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stats.noShowCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stats.noShowRate}%</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">취소됨</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stats.cancelledCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stats.cancellationRate}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminDashboard;