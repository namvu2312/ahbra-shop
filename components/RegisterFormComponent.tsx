import React, { useState } from 'react';
import InputWithIcon from './InputWithIcon';
import { EmailIcon, LockIcon } from './icons';

// Khai báo để TypeScript nhận diện đối tượng 'firebase' toàn cục từ script
declare const firebase: any;

interface RegisterFormComponentProps {
  onToggleView: () => void;
}

const RegisterFormComponent: React.FC<RegisterFormComponentProps> = ({ onToggleView }) => {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null); // Xóa lỗi cũ
    setSuccessMessage(null); // Xóa thông báo thành công cũ

    const { email, password, confirmPassword } = event.currentTarget.elements as any;
    
    // 1. Kiểm tra mật khẩu khớp
    if (password.value !== confirmPassword.value) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    // 2. Gọi Firebase để đăng ký
    try {
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email.value, password.value);
      console.log('User registered successfully:', userCredential.user);
      
      // Hiển thị thông báo thành công
      setSuccessMessage("Đăng ký tài khoản thành công! Đang chuyển hướng...");

      // Chuyển hướng sau 2 giây để người dùng kịp đọc thông báo
      setTimeout(() => {
        window.location.href = 'home.html';
      }, 2000);

    } catch (err: any) {
      console.error("Lỗi đăng ký:", err);
      // Xử lý các mã lỗi cụ thể
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('Địa chỉ email này đã được sử dụng bởi một tài khoản khác.');
          break;
        case 'auth/weak-password':
          setError('Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn (ít nhất 6 ký tự).');
          break;
        case 'auth/invalid-email':
          setError('Địa chỉ email không hợp lệ. Vui lòng kiểm tra lại.');
          break;
        default:
          setError(err.message);
          break;
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Tạo tài khoản
      </h2>

      <form onSubmit={handleRegister}>
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
          <InputWithIcon
            icon={<LockIcon />}
            type="password"
            placeholder="Xác nhận mật khẩu"
            id="confirmPassword"
          />
        </div>

        {/* Vùng hiển thị lỗi */}
        {error && (
            <p id="error-message" className="mt-4 text-center text-sm text-red-600 bg-red-100 p-3 rounded-md">
            {error}
            </p>
        )}

        {/* Vùng hiển thị thành công */}
        {successMessage && (
            <p id="success-message" className="mt-4 text-center text-sm text-green-700 bg-green-100 p-3 rounded-md">
            {successMessage}
            </p>
        )}

        <button
          type="submit"
          className="w-full bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-opacity-50 transition-colors duration-300 mt-8"
          disabled={!!successMessage} // Vô hiệu hóa nút khi đang xử lý thành công
        >
          Đăng ký
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600">
        Bạn đã có tài khoản?{' '}
        <a href="#" onClick={(e) => { e.preventDefault(); onToggleView(); }} className="font-semibold text-blue-600 hover:underline">
          Đăng nhập
        </a>
      </p>
    </div>
  );
};

export default RegisterFormComponent;
