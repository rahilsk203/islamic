import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatInterface from '../components/ChatInterface';

// Mock the MessageBubble component
jest.mock('../components/MessageBubble', () => {
  return function MockMessageBubble({ message }) {
    return <div data-testid="message-bubble">{message.content}</div>;
  };
});

describe('ChatInterface', () => {
  const mockMessages = [
    {
      id: 1,
      sender: 'ai',
      content: 'Hello, how can I help you today?',
      timestamp: new Date(),
    },
    {
      id: 2,
      sender: 'user',
      content: 'I have a question about Islamic teachings',
      timestamp: new Date(),
    }
  ];

  const mockOnSendMessage = jest.fn();
  const mockProps = {
    messages: mockMessages,
    onSendMessage: mockOnSendMessage,
    isLoading: false,
    currentSessionId: 'test-session',
    isNewsSearching: false,
    newsSearchProgress: 0,
    newsSearchType: 'news'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders messages correctly', () => {
    render(<ChatInterface {...mockProps} />);
    
    expect(screen.getByText('Hello, how can I help you today?')).toBeInTheDocument();
    expect(screen.getByText('I have a question about Islamic teachings')).toBeInTheDocument();
  });

  test('renders input area', () => {
    render(<ChatInterface {...mockProps} />);
    
    const textarea = screen.getByPlaceholderText('Message IslamicAI...');
    expect(textarea).toBeInTheDocument();
    
    const sendButton = screen.getByRole('button');
    expect(sendButton).toBeInTheDocument();
  });

  test('disables input and send button when loading', () => {
    render(<ChatInterface {...mockProps} isLoading={true} />);
    
    const textarea = screen.getByPlaceholderText('Message IslamicAI...');
    expect(textarea).toBeDisabled();
    
    const sendButton = screen.getByRole('button');
    expect(sendButton).toBeDisabled();
  });

  test('enables send button when there is input text', () => {
    render(<ChatInterface {...mockProps} />);
    
    const textarea = screen.getByPlaceholderText('Message IslamicAI...');
    fireEvent.change(textarea, { target: { value: 'Test message' } });
    
    const sendButton = screen.getByRole('button');
    expect(sendButton).not.toBeDisabled();
  });

  test('calls onSendMessage when send button is clicked', () => {
    render(<ChatInterface {...mockProps} />);
    
    const textarea = screen.getByPlaceholderText('Message IslamicAI...');
    const message = 'Test message';
    fireEvent.change(textarea, { target: { value: message } });
    
    const sendButton = screen.getByRole('button');
    fireEvent.click(sendButton);
    
    expect(mockOnSendMessage).toHaveBeenCalledWith(message, 'user');
  });

  test('clears input after sending message', async () => {
    render(<ChatInterface {...mockProps} />);
    
    const textarea = screen.getByPlaceholderText('Message IslamicAI...');
    const message = 'Test message';
    fireEvent.change(textarea, { target: { value: message } });
    
    const sendButton = screen.getByRole('button');
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(textarea.value).toBe('');
    });
  });

  test('shows news search indicator when searching', () => {
    render(<ChatInterface {...mockProps} isNewsSearching={true} newsSearchProgress={50} />);
    
    expect(screen.getByText('Searching news...')).toBeInTheDocument();
  });

  test('handles Enter key press to send message', () => {
    render(<ChatInterface {...mockProps} />);
    
    const textarea = screen.getByPlaceholderText('Message IslamicAI...');
    const message = 'Test message';
    fireEvent.change(textarea, { target: { value: message } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });
    
    expect(mockOnSendMessage).toHaveBeenCalledWith(message, 'user');
  });

  test('does not send message when Shift+Enter is pressed', () => {
    render(<ChatInterface {...mockProps} />);
    
    const textarea = screen.getByPlaceholderText('Message IslamicAI...');
    const message = 'Test message';
    fireEvent.change(textarea, { target: { value: message } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: true });
    
    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });
});