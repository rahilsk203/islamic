import { useState } from 'react';
import { XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const HelpFAQ = ({ onClose }: { onClose: () => void }) => {
  const [activeSection, setActiveSection] = useState('general');

  const faqSections = [
    {
      id: 'general',
      title: 'General Questions',
      faqs: [
        {
          question: 'What is IslamicAI?',
          answer: 'IslamicAI is an intelligent assistant designed to provide accurate Islamic knowledge and guidance. It helps users understand Islamic teachings, find answers to religious questions, and access information about Islamic practices and principles.'
        },
        {
          question: 'How does IslamicAI ensure accuracy?',
          answer: 'IslamicAI uses verified sources including the Quran, Hadith collections, and works of renowned Islamic scholars. All responses are carefully reviewed to ensure they align with authentic Islamic teachings and principles.'
        },
        {
          question: 'Is my data private?',
          answer: 'Yes, we take your privacy seriously. All conversations are encrypted and we do not share your personal information with third parties. Your data is only used to improve your experience with IslamicAI.'
        }
      ]
    },
    {
      id: 'usage',
      title: 'Using IslamicAI',
      faqs: [
        {
          question: 'How do I start a new conversation?',
          answer: 'Click the "New Chat" button in the sidebar to start a fresh conversation. This will clear the current chat history and begin a new discussion.'
        },
        {
          question: 'Can I search through my chat history?',
          answer: 'Yes, you can use the search bar in the sidebar to find specific topics or questions from your previous conversations.'
        },
        {
          question: 'How do I save important conversations?',
          answer: 'IslamicAI automatically saves your conversations. You can access them anytime through the "Recent Chats" section in the sidebar.'
        }
      ]
    },
    {
      id: 'features',
      title: 'Features & Resources',
      faqs: [
        {
          question: 'What Islamic resources are available?',
          answer: 'IslamicAI provides access to Quranic verses, authentic Hadith collections, prayer times, Islamic jurisprudence, and guidance on various aspects of Islamic life.'
        },
        {
          question: 'Can I get help with prayer times?',
          answer: 'Yes, IslamicAI can provide accurate prayer times based on your location and help you understand the significance of each prayer.'
        },
        {
          question: 'Is there multilingual support?',
          answer: 'Yes, IslamicAI supports multiple languages including English, Urdu, Arabic, and Hinglish to serve a diverse Muslim community.'
        }
      ]
    },
    {
      id: 'account',
      title: 'Account & Settings',
      faqs: [
        {
          question: 'How do I create an account?',
          answer: 'Click the "Sign Up" button on the login page to create your account. You\'ll need to provide a valid email address and create a secure password.'
        },
        {
          question: 'Can I use IslamicAI without an account?',
          answer: 'Yes, you can use IslamicAI as a guest, but creating an account allows you to save your conversations and personalize your experience.'
        },
        {
          question: 'How do I change my language preferences?',
          answer: 'After logging in, go to your profile settings to select your preferred language for interactions with IslamicAI.'
        }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 lg:p-0 lg:items-start lg:justify-center lg:pt-8">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col lg:max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sm:p-6">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">Help & FAQ</h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-gray-100 rounded-full"
          >
            <XIcon className="w-6 h-6" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 overflow-hidden lg:flex-row">
          {/* Sidebar Navigation - Horizontal on mobile, vertical on desktop */}
          <div className="border-b border-gray-200 bg-gray-50 lg:w-64 lg:border-r lg:border-b-0">
            <div className="flex overflow-x-auto lg:flex-col lg:overflow-visible">
              <nav className="flex p-2 space-x-1 lg:flex-col lg:space-x-0 lg:space-y-1 lg:p-4">
                {faqSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`whitespace-nowrap px-3 py-2 text-sm rounded-lg transition-colors lg:whitespace-normal lg:px-4 lg:py-3 lg:text-left ${
                      activeSection === section.id
                        ? 'bg-green-100 text-green-800 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* FAQ Content */}
          <ScrollArea className="flex-1 p-4 sm:p-6">
            {faqSections
              .filter((section) => section.id === activeSection)
              .map((section) => (
                <div key={section.id}>
                  <h3 className="text-lg font-semibold mb-4 text-foreground sm:text-xl sm:mb-6">{section.title}</h3>
                  <div className="space-y-4 sm:space-y-6">
                    {section.faqs.map((faq, index) => (
                      <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0 sm:pb-6">
                        <h4 className="text-base font-medium text-foreground mb-2 sm:text-lg sm:mb-3">{faq.question}</h4>
                        <p className="text-sm text-gray-600 sm:text-base">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 sm:p-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-center text-gray-500 sm:text-sm sm:text-left">
              Need more help? Contact us at support@islamicai.com
            </p>
            <Button onClick={onClose} className="w-full sm:w-auto">Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpFAQ;