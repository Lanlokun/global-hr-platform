function AuthButton({ children, onClick, loading, type = "button" }) {
  return (
    <button type={type} onClick={onClick} disabled={loading} className="auth-btn">
      {loading ? "Please wait..." : children}
    </button>
  );
}

export default AuthButton;