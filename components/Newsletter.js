import React, { useState } from 'react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (email) {
      setSubscribed(true);
      // Add logic to handle subscription (e.g., API call)
      console.log(`${email} subscribed!`);
    }
  };

  const handleUnsubscribe = () => {
    setSubscribed(false);
    // Add logic to handle unsubscription (e.g., API call)
    console.log(`${email} unsubscribed!`);
  };

  return (
    <div style={{ background: '#2c3e50', padding: '20px', borderRadius: '5px', textAlign: 'center' }}>
      <h2 style={{ color: '#ecf0f1' }}>Subscribe to our Newsletter</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        style={{ padding: '10px', borderRadius: '5px', border: 'none', marginRight: '10px' }}
      />
      <button
        onClick={handleSubscribe}
        style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', background: '#e74c3c', color: '#ecf0f1' }}
      >
        Subscribe
      </button>
      {subscribed && (
        <button
          onClick={handleUnsubscribe}
          style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', background: '#2ecc71', color: '#ecf0f1', marginLeft: '10px' }}
        >
          Unsubscribe
        </button>
      )}
    </div>
  );
};

export default Newsletter;