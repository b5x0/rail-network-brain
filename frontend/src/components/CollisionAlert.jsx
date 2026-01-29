import React, { useState, useEffect } from 'react';
import { getOptions, executeOption } from '../services/api';

function CollisionAlert({ alert }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (alert) {
      fetchOptions();
    }
  }, [alert]);

  const fetchOptions = async () => {
    try {
      const opts = await getOptions();
      setOptions(opts);
    } catch (err) {
      console.error('Error fetching options:', err);
    }
  };

  const handleResolve = async (option) => {
    setLoading(true);
    try {
      await executeOption(alert.id, option.train, option.action);
      console.log('✅ Resolution executed:', option.action);
    } catch (err) {
      console.error('❌ Error executing resolution:', err);
    }
    setLoading(false);
  };

  if (!alert) return null;

  return (
    <div className="bg-red-100 border-4 border-red-500 rounded-lg p-4 mb-4">
      <h3 className="text-2xl font-bold text-red-800 mb-2">🚨 COLLISION ALERT</h3>
      <p className="text-lg mb-3">
        Location: <strong>{alert.location}</strong><br/>
        Trains: <strong>{alert.trains.join(', ')}</strong>
      </p>
      
      <div className="space-y-2">
        {options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleResolve(option)}
            disabled={loading}
            className="block w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {option.action} ({option.train}) - {option.desc}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CollisionAlert;