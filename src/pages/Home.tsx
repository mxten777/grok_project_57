import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, Users, MapPin } from 'lucide-react';

interface Space {
  id: string;
  name: string;
  type: 'program' | 'room' | 'studyroom';
  capacity: number;
  description: string;
  location: string;
  imageUrl: string;
}

const Home = () => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCapacity, setSelectedCapacity] = useState<string>('all');

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        setLoading(true);
        setError(null);
        const querySnapshot = await getDocs(collection(db, 'spaces'));
        const spacesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Space));
        // If no data in Firestore, use sample data
        if (spacesData.length === 0) {
          setSpaces([
            {
              id: 'sample1',
              name: '프로그래밍 워크숍',
              type: 'program',
              capacity: 20,
              description: '초보자를 위한 프로그래밍 워크숍',
              location: '세미나실 A',
              imageUrl: 'https://via.placeholder.com/300x200?text=Programming+Workshop'
            },
            {
              id: 'sample2',
              name: '스터디룸 101',
              type: 'studyroom',
              capacity: 4,
              description: '개인 스터디용 룸',
              location: '2층',
              imageUrl: 'https://via.placeholder.com/300x200?text=Study+Room+101'
            },
            {
              id: 'sample3',
              name: '강의실 B',
              type: 'room',
              capacity: 30,
              description: '소규모 강의용 강의실',
              location: '1층',
              imageUrl: 'https://via.placeholder.com/300x200?text=Lecture+Room+B'
            }
          ]);
        } else {
          setSpaces(spacesData);
        }
      } catch (error) {
        console.error('Error fetching spaces:', error);
        setError('공간 정보를 불러오는데 실패했습니다.');
        // Fallback to sample data
        setSpaces([
          {
            id: 'sample1',
            name: '프로그래밍 워크숍',
            type: 'program',
            capacity: 20,
            description: '초보자를 위한 프로그래밍 워크숍',
            location: '세미나실 A',
            imageUrl: 'https://via.placeholder.com/300x200?text=Programming+Workshop'
          },
          {
            id: 'sample2',
            name: '스터디룸 101',
            type: 'studyroom',
            capacity: 4,
            description: '개인 스터디용 룸',
            location: '2층',
            imageUrl: 'https://via.placeholder.com/300x200?text=Study+Room+101'
          },
          {
            id: 'sample3',
            name: '강의실 B',
            type: 'room',
            capacity: 30,
            description: '소규모 강의용 강의실',
            location: '1층',
            imageUrl: 'https://via.placeholder.com/300x200?text=Lecture+Room+B'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchSpaces();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner size="lg" message="공간 정보를 불러오는 중..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // Filter spaces based on search and filters
  const filteredSpaces = spaces.filter(space => {
    const matchesSearch = space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         space.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         space.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || space.type === selectedType;
    
    const matchesCapacity = selectedCapacity === 'all' ||
                           (selectedCapacity === 'small' && space.capacity <= 10) ||
                           (selectedCapacity === 'medium' && space.capacity > 10 && space.capacity <= 30) ||
                           (selectedCapacity === 'large' && space.capacity > 30);
    
    return matchesSearch && matchesType && matchesCapacity;
  });

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-8">도서관 예약 시스템</h1>
      
      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="공간명, 설명, 위치로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Type Filter */}
          <div className="w-full md:w-48">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">모든 유형</option>
              <option value="program">프로그램</option>
              <option value="room">강의실</option>
              <option value="studyroom">스터디룸</option>
            </select>
          </div>
          
          {/* Capacity Filter */}
          <div className="w-full md:w-48">
            <select
              value={selectedCapacity}
              onChange={(e) => setSelectedCapacity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">모든 정원</option>
              <option value="small">소규모 (10명 이하)</option>
              <option value="medium">중규모 (11-30명)</option>
              <option value="large">대규모 (30명 초과)</option>
            </select>
          </div>
        </div>
        
        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          총 {filteredSpaces.length}개의 공간이 검색되었습니다.
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSpaces.map((space, index) => (
          <motion.div
            key={space.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <img src={space.imageUrl} alt={space.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{space.name}</h2>
              <p className="text-gray-600 mb-2">{space.description}</p>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  정원: {space.capacity}명
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  {space.location}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  space.type === 'program' ? 'bg-blue-100 text-blue-800' :
                  space.type === 'room' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {space.type === 'program' ? '프로그램' :
                   space.type === 'room' ? '강의실' : '스터디룸'}
                </span>
                <Link
                  to={`/reservation/${space.id}`}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  예약하기
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Home;