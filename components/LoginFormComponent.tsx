import React, { useState } from 'react';
import InputWithIcon from './InputWithIcon';
import SocialButton from './SocialButton';
import { EmailIcon, LockIcon, GoogleIcon, FacebookIcon } from './icons';

// Khai báo để TypeScript nhận diện đối tượng 'firebase' toàn cục từ script
declare const firebase: any;

interface LoginFormComponentProps {
  onToggleView: () => void;
}

const LoginFormComponent: React.FC<LoginFormComponentProps> = ({ onToggleView }) => {
  const [error, setError] = useState<string | null>(null);

  // --- ADMIN CREDENTIALS ---
  const ADMIN_EMAIL = 'admin@ahbra.com';
  const ADMIN_PASSWORD = 'adminpassword123';


  // --- XỬ LÝ ĐĂNG NHẬP BẰNG EMAIL/MẬT KHẨU ---
  const handleEmailLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const { email, password } = event.currentTarget.elements as any;

    // --- Admin Login Check ---
    if (email.value === ADMIN_EMAIL && password.value === ADMIN_PASSWORD) {
      console.log('Admin login successful. Redirecting to admin dashboard...');
      window.location.href = 'admin.html'; // Chuyển hướng admin
      return; // Dừng thực thi để không gọi Firebase
    }

    // --- Regular User Firebase Login ---
    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email.value, password.value);
      console.log('User signed in:', userCredential.user);
      window.location.href = 'home.html'; // Chuyển hướng khi thành công
    } catch (err: any) {
      console.error("Lỗi đăng nhập Email:", err);
      setError(err.message); // Hiển thị thông báo lỗi từ Firebase
    }
  };


  // --- XỬ LÝ ĐĂNG NHẬP MẠNG XÃ HỘI ---

  // 1. Khởi tạo nhà cung cấp (Providers)
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const facebookProvider = new firebase.auth.FacebookAuthProvider();

  // 2. Xây dựng hàm đăng nhập chung
  const signInWithProvider = async (provider: any) => {
    setError(null); // Xóa lỗi cũ
    try {
      const result = await firebase.auth().signInWithPopup(provider);
      // Xử lý thành công: chuyển hướng đến trang chủ
      console.log('Đăng nhập MXH thành công:', result.user);
      window.location.href = 'home.html';
    } catch (err: any) {
      console.error('Lỗi đăng nhập MXH:', err);
      // Xử lý thất bại: hiển thị thông báo lỗi
      if (err.code === 'auth/account-exists-with-different-credential') {
        setError('Tài khoản đã tồn tại với email này nhưng sử dụng phương thức đăng nhập khác. Vui lòng thử lại với phương thức ban đầu.');
      } else {
        setError(err.message); // Hiển thị lỗi chung
      }
    }
  };


  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Đăng nhập
      </h2>

      <form onSubmit={handleEmailLogin}>
        <div className="space-y-4">
          <InputWithIcon
            icon={<EmailIcon />}
            type="email"
            placeholder="Email"
            id="email"
          />
          <InputWithIcon
            icon={<LockIcon />}
            type="password"
            placeholder="Mật khẩu"
            id="password"
          />
        </div>

        <div className="mt-4 mb-6">
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900 hover:underline float-right">
            Quên mật khẩu?
          </a>
        </div>

        <button
          type="submit"
          className="w-full bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-opacity-50 transition-colors duration-300"
        >
          Đăng nhập
        </button>
      </form>
      
      {/* Vùng hiển thị lỗi */}
      {error && (
        <p id="error-message" className="mt-4 text-center text-sm text-red-600 bg-red-100 p-3 rounded-md">
          {error}
        </p>
      )}

      <div className="flex items-center my-8">
        <hr className="flex-grow border-t border-gray-300" />
        <span className="px-4 text-sm text-gray-500">Hoặc đăng nhập với</span>
        <hr className="flex-grow border-t border-gray-300" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* 3. Thêm sự kiện Click */}
        <SocialButton
          icon={<GoogleIcon />}
          text="Google"
          onClick={() => signInWithProvider(googleProvider)}
        />
        <SocialButton
          icon={<FacebookIcon />}
          text="Facebook"
          onClick={() => signInWithProvider(facebookProvider)}
        />
      </div>

      <p className="mt-8 text-center text-sm text-gray-600">
        Bạn chưa có tài khoản?{' '}
        <a href="#" onClick={(e) => { e.preventDefault(); onToggleView(); }} className="font-semibold text-blue-600 hover:underline">
          Đăng ký ngay
        </a>
      </p>
    </div>
  );
};

export default LoginFormComponent;