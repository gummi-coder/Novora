# 🎯 Survey Builder - Novora

A beautiful, modern survey builder with drag-and-drop functionality, multiple question types, and real-time preview.

## ✨ Features

### 🎨 **Beautiful UI/UX**
- Modern, clean interface with Tailwind CSS
- Responsive design that works on all devices
- Smooth animations and transitions
- Intuitive drag-and-drop question management

### 📝 **Question Types**
- **Short Text** - Single line text input
- **Long Text** - Multi-line text area
- **Multiple Choice** - Radio button selection
- **Checkboxes** - Multi-select options
- **Rating** - Star rating system
- **Date** - Date picker
- **Number** - Numeric input
- **Email** - Email validation
- **URL** - Website URL input

### 🔧 **Survey Management**
- **Create Surveys** - Beautiful builder interface
- **View Surveys** - List with search, filter, and sort
- **Edit Surveys** - Modify existing surveys
- **Activate/Close** - Control survey status
- **Delete Surveys** - Remove unwanted surveys

### 📊 **Advanced Features**
- **Real-time Preview** - See how your survey looks
- **Survey Settings** - Configure behavior and permissions
- **Question Validation** - Required field support
- **Option Management** - Add/remove choices for multiple choice
- **Duplicate Questions** - Copy existing questions
- **Survey Statistics** - Question count, estimated time

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ with FastAPI backend running

### Installation
```bash
# Frontend (Vite React)
cd frontend
npm install
npm run dev

# Backend (FastAPI)
cd backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Usage
1. **Sign In** - Navigate to `/auth/signin`
2. **Dashboard** - Go to `/dashboard`
3. **Create Survey** - Click "Create Survey" button
4. **Build Survey** - Add questions using the sidebar
5. **Preview** - Click "Preview" to see the result
6. **Save** - Click "Save Survey" when ready

## 🎯 How to Use the Survey Builder

### 1. **Adding Questions**
- Use the sidebar on the right to add different question types
- Each question type has an icon and description
- Questions are added to the main content area

### 2. **Editing Questions**
- Click on question text to edit
- Add descriptions for help text
- Toggle "Required" checkbox
- For multiple choice: add/remove options

### 3. **Managing Questions**
- **Duplicate** - Copy a question with all settings
- **Delete** - Remove unwanted questions
- **Reorder** - Drag questions to reorder (coming soon)

### 4. **Survey Settings**
- **Allow Anonymous** - Let users respond without accounts
- **Require Email** - Collect email addresses
- **Show Progress** - Display progress bar to respondents

### 5. **Preview & Save**
- **Preview** - See exactly how respondents will see it
- **Save** - Store survey in database
- **Activate** - Make survey live for responses

## 🔗 API Integration

The survey builder integrates with the FastAPI backend:

### Create Survey
```typescript
POST /api/v1/surveys/
{
  "title": "Survey Title",
  "description": "Survey description",
  "is_anonymous": true,
  "allow_comments": false,
  "questions": [
    {
      "text": "What is your name?",
      "type": "text",
      "required": true,
      "order": 0
    }
  ]
}
```

### Question Types Mapping
| Frontend Type | Backend Type | Description |
|---------------|--------------|-------------|
| `text` | `text` | Short text input |
| `long_text` | `long_text` | Multi-line text |
| `multiple_choice` | `multiple_choice` | Radio buttons |
| `checkbox` | `checkbox` | Checkboxes |
| `rating` | `rating` | Star rating |
| `date` | `date` | Date picker |
| `number` | `number` | Numeric input |
| `email` | `email` | Email validation |
| `url` | `url` | URL input |

## 🎨 UI Components

### Question Editor
- **Card Layout** - Clean, organized question cards
- **Type Badges** - Visual indicators for question types
- **Action Buttons** - Duplicate, delete, settings
- **Form Controls** - Input fields, textareas, checkboxes

### Sidebar
- **Question Types** - Grid of available question types
- **Survey Stats** - Real-time statistics
- **Sticky Positioning** - Always visible while scrolling

### Header
- **Navigation** - Back to dashboard
- **Actions** - Preview, settings, save
- **Progress** - Visual feedback

## 🔮 Future Enhancements

### Planned Features
- **Drag & Drop Reordering** - Visual question reordering
- **Question Templates** - Pre-built question sets
- **Conditional Logic** - Show/hide questions based on answers
- **File Upload** - Allow file attachments
- **Rich Text Editor** - Enhanced question formatting
- **Survey Themes** - Customizable styling
- **Collaboration** - Multiple users editing
- **Version History** - Track changes over time

### Advanced Question Types
- **Matrix Questions** - Rating grids
- **Ranking** - Drag to rank options
- **Slider** - Range selection
- **Signature** - Digital signatures
- **Location** - GPS coordinates
- **Audio/Video** - Media responses

## 🛠️ Technical Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Lucide React** - Icons

### Backend
- **FastAPI** - API framework
- **SQLAlchemy** - ORM
- **PostgreSQL** - Database
- **Pydantic** - Data validation
- **JWT** - Authentication

## 📱 Responsive Design

The survey builder is fully responsive:

- **Desktop** - Full sidebar, large question cards
- **Tablet** - Collapsible sidebar, medium cards
- **Mobile** - Stacked layout, touch-friendly buttons

## 🎯 Best Practices

### Survey Design
1. **Clear Titles** - Make survey purpose obvious
2. **Logical Flow** - Order questions logically
3. **Required Fields** - Only mark essential questions
4. **Preview Always** - Test before publishing
5. **Mobile Testing** - Check on mobile devices

### Performance
- **Lazy Loading** - Load components as needed
- **Optimized Images** - Compress and optimize
- **Efficient State** - Minimize re-renders
- **Caching** - Cache API responses

## 🐛 Troubleshooting

### Common Issues
1. **Questions not saving** - Check backend connection
2. **Preview not working** - Verify question data
3. **Styling issues** - Clear browser cache
4. **API errors** - Check authentication token

### Debug Mode
Enable debug logging:
```typescript
console.log('Survey data:', surveyData);
console.log('Questions:', questions);
```

## 📄 License

This survey builder is part of the Novora platform.

---

**Built with ❤️ using modern web technologies** 