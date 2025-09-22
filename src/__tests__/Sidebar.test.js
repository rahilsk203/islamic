import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Sidebar from '../components/Sidebar';

// Mock the API utilities
jest.mock('../utils/api', () => ({
  deleteChatSession: jest.fn(),
  searchChatHistory: jest.fn(() => []),
  getChatStatistics: jest.fn(() => ({
    totalSessions: 5,
    totalMessages: 25,
    averageMessagesPerSession: 5
  })),
  getSessionAnalytics: jest.fn(() => ({
    analytics: {
      conversationLength: 10,
      topicDiversity: 8
    }
  })),
  getLearningInsights: jest.fn(() => ({
    intelligenceGain: 0.15,
    patternRecognitionAccuracy: 0.85
  }))
}));

// Mock the timestamp utility
jest.mock('../utils/timestamp', () => ({
  getRelativeTime: jest.fn(() => '2 hours ago')
}));

describe('Sidebar', () => {
  const mockProps = {
    isOpen: true,
    toggleSidebar: jest.fn(),
    recentChats: [
      {
        id: '1',
        title: 'Understanding Islam',
        preview: 'Can you explain the five pillars?',
        timestamp: new Date(),
        messageCount: 5
      },
      {
        id: '2',
        title: 'Prayer Times',
        preview: 'What are the correct timings?',
        timestamp: new Date(),
        messageCount: 3
      }
    ],
    startNewChat: jest.fn(),
    loadChatSession: jest.fn(),
    currentSessionId: '1'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders sidebar with recent chats', () => {
    render(<Sidebar {...mockProps} />);
    
    expect(screen.getByText('IslamicAI')).toBeInTheDocument();
    expect(screen.getByText('Understanding Islam')).toBeInTheDocument();
    expect(screen.getByText('Prayer Times')).toBeInTheDocument();
  });

  test('shows active chat with highlighted styling', () => {
    render(<Sidebar {...mockProps} />);
    
    const activeChat = screen.getByText('Understanding Islam').closest('.group');
    expect(activeChat).toHaveClass('bg-gray-100');
  });

  test('calls loadChatSession when chat is clicked', () => {
    render(<Sidebar {...mockProps} />);
    
    const chatItem = screen.getByText('Prayer Times');
    fireEvent.click(chatItem);
    
    expect(mockProps.loadChatSession).toHaveBeenCalledWith('2');
  });

  test('calls startNewChat when new chat button is clicked', () => {
    render(<Sidebar {...mockProps} />);
    
    const newChatButton = screen.getByTitle('Start New Chat');
    fireEvent.click(newChatButton);
    
    expect(mockProps.startNewChat).toHaveBeenCalled();
  });

  test('shows search input and handles search', () => {
    render(<Sidebar {...mockProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search chats...');
    expect(searchInput).toBeInTheDocument();
    
    fireEvent.change(searchInput, { target: { value: 'prayer' } });
    
    // Since we're mocking searchChatHistory to return empty array,
    // we should see the "No chats found" message
    expect(screen.getByText('No chats found')).toBeInTheDocument();
  });

  test('renders topics section when topics tab is selected', () => {
    render(<Sidebar {...mockProps} />);
    
    // Click on topics tab
    const topicsTab = screen.getByText('Topics');
    fireEvent.click(topicsTab);
    
    expect(screen.getByText('Islamic Topics')).toBeInTheDocument();
    expect(screen.getByText('Quran')).toBeInTheDocument();
    expect(screen.getByText('Hadith')).toBeInTheDocument();
  });

  test('calls toggleSidebar when close button is clicked', () => {
    render(<Sidebar {...mockProps} />);
    
    const closeButton = screen.getByLabelText('Close sidebar');
    fireEvent.click(closeButton);
    
    expect(mockProps.toggleSidebar).toHaveBeenCalled();
  });
});