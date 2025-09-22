import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MessageBubble from '../components/MessageBubble';

// Mock the formatTimestamp utility
jest.mock('../utils/timestamp', () => ({
  formatTimestamp: jest.fn(() => '2:30 PM')
}));

describe('MessageBubble', () => {
  const baseMessage = {
    id: 1,
    sender: 'user',
    content: 'Hello, this is a test message',
    timestamp: new Date(),
  };

  test('renders user message correctly', () => {
    render(<MessageBubble message={baseMessage} />);
    
    expect(screen.getByText('Hello, this is a test message')).toBeInTheDocument();
    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.getByText('2:30 PM')).toBeInTheDocument();
    
    // Check for user-specific styling
    const messageContainer = screen.getByText('Hello, this is a test message').closest('.flex');
    expect(messageContainer).toHaveClass('justify-end');
  });

  test('renders AI message correctly', () => {
    const aiMessage = {
      ...baseMessage,
      sender: 'ai',
      content: 'This is a response from the AI'
    };
    
    render(<MessageBubble message={aiMessage} />);
    
    expect(screen.getByText('This is a response from the AI')).toBeInTheDocument();
    expect(screen.getByText('IslamicAI')).toBeInTheDocument();
    expect(screen.getByText('2:30 PM')).toBeInTheDocument();
    
    // Check for AI-specific styling
    const messageContainer = screen.getByText('This is a response from the AI').closest('.flex');
    expect(messageContainer).toHaveClass('justify-start');
  });

  test('shows typing indicator when streaming', () => {
    const aiMessage = {
      ...baseMessage,
      sender: 'ai',
      content: ''
    };
    
    render(<MessageBubble message={aiMessage} isStreaming={true} />);
    
    // Check for typing indicator
    expect(screen.getByText('▌')).toBeInTheDocument();
  });

  test('formats content with line breaks', () => {
    const multilineMessage = {
      ...baseMessage,
      content: 'First line\nSecond line\nThird line'
    };
    
    render(<MessageBubble message={multilineMessage} />);
    
    // Check that content is rendered with line breaks
    expect(screen.getByText('First line')).toBeInTheDocument();
    expect(screen.getByText('Second line')).toBeInTheDocument();
    expect(screen.getByText('Third line')).toBeInTheDocument();
  });

  test('applies correct styling for streaming AI messages', () => {
    const aiMessage = {
      ...baseMessage,
      sender: 'ai',
      content: 'AI response'
    };
    
    render(<MessageBubble message={aiMessage} isStreaming={true} />);
    
    // Check for streaming-specific elements
    expect(screen.getByText('▌')).toBeInTheDocument();
  });
});