import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const EyeIcon = ({ visible }) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z" />
    <circle cx="12" cy="12" r="3" />
    {visible ? null : <path d="M4 4l16 16" />}
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login({
        username: formData.username.trim(),
        password: formData.password,
      });
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-heading">
          <span className="login-badge">Pharmacy Management</span>
          <h1>Đăng nhập hệ thống</h1>
          <p>Nhập tài khoản được cấp để truy cập chức năng theo vai trò.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Tên đăng nhập
            <input
              type="text"
              value={formData.username}
              onChange={(event) =>
                setFormData((current) => ({ ...current, username: event.target.value }))
              }
              placeholder="admin, staff hoặc warehouse"
              autoComplete="username"
              required
            />
          </label>

          <label>
            Mật khẩu
            <div className="password-input-wrap">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, password: event.target.value }))
                }
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                <EyeIcon visible={showPassword} />
              </button>
            </div>
          </label>

          <button type="submit" className="btn-save login-submit" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        {/* <div className="login-demo">
          <h3>Tài khoản mẫu</h3>
          <p>
            <code>admin / admin123</code>
          </p>
          <p>
            <code>staff / staff123</code>
          </p>
          <p>
            <code>warehouse / warehouse123</code>
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default Login;
