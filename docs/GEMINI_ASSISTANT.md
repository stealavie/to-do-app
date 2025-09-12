# Gemini AI Assistant Feature

## Overview

The application now includes an intelligent AI chatbot assistant powered by Google's Gemini API. The assistant analyzes your project data to provide personalized recommendations and help with your learning goals.

## Key Features

### 🔑 API Key Management
- **Secure Local Storage**: Your Gemini API key is stored locally in your browser and never shared with our servers
- **First-time Setup**: On first use, a modal will prompt you to enter your API key
- **Easy Configuration**: Access API key settings anytime through the chat interface

### 💬 Intelligent Chat Interface
- **Floating Chat Bubble**: Located in the bottom-right corner of the screen
- **Modern UI**: Clean, intuitive chat interface with message history
- **Context-Aware**: The assistant has access to your project data for personalized recommendations

### 🧠 Smart Recommendations
The assistant analyzes your:
- Learning groups and membership roles
- Project assignments and statuses
- Deadlines and priorities
- Collaboration patterns

And provides:
- Project prioritization advice
- Deadline management tips
- Collaboration suggestions
- Learning goal recommendations
- Productivity insights

## Getting Started

### 1. Get Your Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key (starts with "AI...")

### 2. Set Up the Assistant
1. Look for the floating chat bubble in the bottom-right corner
2. Click to open the chat interface
3. When prompted, paste your API key
4. Start chatting!

### 3. Using the Assistant
The assistant can help you with:
- **"What should I prioritize today?"** - Get recommendations based on your current projects
- **"I'm struggling with deadlines"** - Receive time management advice
- **"How can I improve collaboration?"** - Get team-specific suggestions
- **"Analyze my workload"** - Understand your current project distribution

## Privacy & Security

- ✅ **Local Storage**: API keys are stored only in your browser's localStorage
- ✅ **Direct Communication**: Your key is used only to communicate directly with Google's API
- ✅ **No Server Storage**: We never see, store, or transmit your API key
- ✅ **Contextual Privacy**: Only your project data from our platform is used for context

## Technical Details

### Frontend Components
- `ApiKeyModal`: Secure API key input and management
- `ChatBubble`: Floating chat entry point
- `ChatWindow`: Main chat interface
- `ChatContext`: State management for chat functionality

### Backend Integration
- `/api/chat/message`: Processes chat messages with user context
- `/api/chat/context`: Retrieves user project data for AI analysis
- Intelligent context generation from your project database

### Features
- Message history persistence
- Error handling and user feedback
- Responsive UI design
- Loading states and animations
- Context-aware AI responses

## Troubleshooting

### Common Issues

**"Invalid API key" error**
- Ensure your API key starts with "AI"
- Verify the key is correctly copied from Google AI Studio
- Check if your Google account has API access enabled

**"API quota exceeded" error**
- Check your usage limits in Google AI Studio
- Consider upgrading your API plan if needed

**Chat not appearing**
- Ensure you're logged into the application
- The chat is only available for authenticated users
- Try refreshing the page

### Support
If you encounter issues:
1. Check the browser console for error messages
2. Verify your API key is valid
3. Ensure you have an active internet connection
4. Try clearing your browser's localStorage and re-entering the API key

## Development Notes

The Gemini assistant is integrated seamlessly into the existing application architecture:
- Uses the same authentication system
- Follows established UI/UX patterns
- Maintains consistent error handling
- Leverages existing state management patterns

The implementation includes proper TypeScript typing, error boundaries, and follows React best practices for maintainability and scalability.

## Future Enhancements: Deeper AI Integration

This section outlines the planned integration of Gemini AI to further enhance the StudyFlow platform. These features are designed to streamline workflows, improve productivity, and provide intelligent assistance to users.

### 1. AI Task Generation
- **Description**: Upon creating a new project, users can provide a high-level description of their goals. The Gemini AI assistant will analyze this description and automatically generate a structured list of recommended tasks and sub-tasks.
- **User Flow**:
    1. User creates a project with a title and a detailed description.
    2. User clicks a "Generate Tasks with AI" button.
    3. The AI processes the description and returns a list of suggested tasks.
    4. User can review, edit, and approve the tasks to add them to the project.
- **Benefit**: Reduces the mental load of project planning and ensures comprehensive task coverage from the outset.

### 2. Smart Scheduling
- **Description**: The AI will recommend optimal due dates for projects and tasks based on several factors, including the team's current workload, historical performance on similar projects, and the estimated complexity of the tasks.
- **User Flow**:
    1. When creating a project or task, the due date field will feature an "AI Suggestion" option.
    2. The AI analyzes the team's schedule and project scope.
    3. It proposes a realistic deadline, which the user can accept or override.
- **Benefit**: Helps teams set achievable goals, prevents burnout, and improves time management.

### 3. Progress Summarization
- **Description**: A feature that allows users to generate on-demand summaries of project progress. The AI will synthesize recent activity, completed tasks, and current blockers into a concise report.
- **User Flow**:
    1. Inside a project or group, a user can request a "Progress Summary."
    2. The user can select a time frame (e.g., last 24 hours, last week).
    3. The AI generates a markdown-formatted summary that can be shared with team members or instructors.
- **Benefit**: Keeps all stakeholders informed, facilitates quick reviews, and helps identify issues before they escalate.

### 4. Learning Resource Recommendations
- **Description**: Based on the keywords and concepts found in project titles and descriptions, the AI will proactively recommend relevant learning materials.
- **User Flow**:
    1. As users work on a project, a "Recommended Resources" section will appear.
    2. The AI fetches and displays links to articles, tutorials, documentation, and academic papers related to the project's subject matter.
- **Benefit**: Supports the learning process by providing timely and context-aware information, helping users acquire the knowledge needed to complete their tasks.