import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated } = useSelector((state) => state.auth || {});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: 'auth/logout' });
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">Skillshare</Link>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/feed">Feed</Link>
        {isAuthenticated && <Link to="/social">Social</Link>}
        {isAuthenticated && <Link to="/create-post">Create Post</Link>}
        <Link to="/learning-progress">Learning Progress</Link>
        {isAuthenticated ? (
          <>
            <Link to="/profile">Profile</Link>
            <button onClick={handleLogout} className="navbar-btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 