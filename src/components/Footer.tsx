import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-secondary-900 text-secondary-100 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">도</span>
              </div>
              <span className="text-xl font-bold">도서관 예약</span>
            </div>
            <p className="text-secondary-400 text-sm">
              공공도서관의 프로그램, 강의실, 스터디룸을 편리하게 예약하세요.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">빠른 링크</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-secondary-400 hover:text-white transition-colors">
                  홈
                </Link>
              </li>
              <li>
                <Link to="/calendar" className="text-secondary-400 hover:text-white transition-colors">
                  캘린더
                </Link>
              </li>
              <li>
                <Link to="/my-reservations" className="text-secondary-400 hover:text-white transition-colors">
                  내 예약
                </Link>
              </li>
              <li>
                <Link to="/checkin" className="text-secondary-400 hover:text-white transition-colors">
                  체크인
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">연락처</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-secondary-400" />
                <span className="text-secondary-400">서울시 강남구 도서관로 123</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-secondary-400" />
                <span className="text-secondary-400">02-123-4567</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-secondary-400" />
                <span className="text-secondary-400">info@library-reservation.kr</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">팔로우</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-secondary-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-secondary-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-secondary-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-800 mt-8 pt-8 text-center text-sm text-secondary-400">
          <p>&copy; 2025 도서관 예약 시스템. 모든 권리 보유.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;