import React, { useState } from 'react';
import { sendMessageStreaming } from '../utils/api';

const StreamingTest = () => {
  const [message, setMessage] = useState('What are the five pillars of Islam?');
  const [response, setResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState('');
  const sessionId = 'test_session_' + Date.now();

  const testStreaming = async () => {
    setIsStreaming(true);
    setResponse('');
    setStatus('Starting streaming...');

    try {
      const result = await sendMessageStreaming(sessionId, message, {
        onStreamStart: () => {
          setStatus('✅ Streaming started');
        },
        onStreamChunk: (chunk, fullContent) => {
          setResponse(fullContent);
          setStatus(`📡 Streaming... (${fullContent.length} chars)`);
        },
        onStreamEnd: (fullContent) => {
          setResponse(fullContent);
          setStatus(`✅ Streaming completed (${fullContent.length} chars)`);
          setIsStreaming(false);
        },
        onStreamError: (error) => {
          setStatus(`❌ Error: ${error}`);
          setIsStreaming(false);
        }
      });
      
      console.log('Streaming test result:', result);
      
    } catch (error) {
      setStatus(`❌ Failed: ${error.message}`);
      setIsStreaming(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto m-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">🕌 Streaming Test Component</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Test Message:
        </label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your Islamic question..."
        />
      </div>
      
      <button
        onClick={testStreaming}
        disabled={isStreaming}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 ${
          isStreaming 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-lg'
        }`}
      >
        {isStreaming ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 bg-white rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-4 h-4 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <span>Streaming...</span>
          </div>
        ) : (
          '📡 Test Streaming Response'
        )}
      </button>
      
      {status && (
        <div className={`mt-4 p-3 rounded-lg ${
          status.includes('✅') ? 'bg-green-100 text-green-800' :
          status.includes('❌') ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          <strong>Status:</strong> {status}
        </div>
      )}
      
      {response && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Response:</h3>
          <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {response}
              {isStreaming && (
                <span className="ml-2 animate-pulse text-blue-500 font-bold">▌</span>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h4 className="font-semibold text-yellow-800 mb-2">📋 Test Instructions:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>1. Make sure the backend is running on port 8787</li>
          <li>2. Click the test button to send a streaming request</li>
          <li>3. Watch the response appear in real-time</li>
          <li>4. Check browser console for detailed logs</li>
        </ul>
      </div>
    </div>
  );
};

export default StreamingTest;