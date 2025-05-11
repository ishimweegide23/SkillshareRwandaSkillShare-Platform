const ErrorMessage = ({ message }) => {
  if (!message) return null;
  return (
    <div style={{ color: 'red', margin: '10px 0', textAlign: 'center' }}>
      {message}
    </div>
  );
};

export default ErrorMessage; 