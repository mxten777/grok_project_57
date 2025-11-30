import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

interface FeedbackProps {
  programId: string;
  onSubmit: () => void;
}

const Feedback: React.FC<FeedbackProps> = ({ programId, onSubmit }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user already submitted feedback
    const checkFeedback = async () => {
      if (!user) return;
      const q = query(
        collection(db, 'feedback'),
        where('programId', '==', programId),
        where('userId', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setSubmitted(true);
      }
    };
    checkFeedback();
  }, [programId, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || rating === 0) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        programId,
        userId: user.uid,
        rating,
        comment,
        createdAt: new Date().toISOString(),
      });
      setSubmitted(true);
      onSubmit();
    } catch (error) {
      console.error('Feedback submission error:', error);
      alert('피드백 제출 중 오류가 발생했습니다.');
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <motion.div
        className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-green-800">피드백을 제출해 주셔서 감사합니다!</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md p-6 mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h3 className="text-lg font-semibold mb-4">만족도 조사</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">별점</label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">코멘트 (선택)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-2 border rounded"
            rows={3}
            placeholder="프로그램에 대한 의견을 남겨주세요..."
          />
        </div>
        <button
          type="submit"
          disabled={loading || rating === 0}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? '제출 중...' : '피드백 제출'}
        </button>
      </form>
    </motion.div>
  );
};

export default Feedback;