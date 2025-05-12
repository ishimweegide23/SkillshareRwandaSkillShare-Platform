const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 100 }}>
    <div className="lds-dual-ring"></div>
    <style>{`
      .lds-dual-ring {
        display: inline-block;
        width: 48px;
        height: 48px;
      }
      .lds-dual-ring:after {
        content: " ";
        display: block;
        width: 32px;
        height: 32px;
        margin: 8px;
        border-radius: 50%;
        border: 4px solid #1976d2;
        border-color: #1976d2 transparent #1976d2 transparent;
        animation: lds-dual-ring 1.2s linear infinite;
      }
      @keyframes lds-dual-ring {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export default LoadingSpinner; 