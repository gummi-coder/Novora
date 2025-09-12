# 🚀 Multi-Step Survey Builder - Novora

A simplified, step-by-step survey builder designed for HR managers to create effective employee surveys quickly and confidently.

## 🎯 **Flow Overview**

### **Step 1: Choose Your Path**
Three clear options presented as cards:
- **Auto-Pilot**: Set it and forget it (3, 6, 12 months)
- **Template**: Pre-built survey sets (time-based or scenario-based)
- **Build My Own**: Full customization with drag-and-drop

### **Step 2: Configure Your Survey**
Path-specific configuration:
- **Auto-Pilot** → Choose plan (Quarterly, Half-Year, Annual)
- **Template** → Select from template gallery
- **Build My Own** → Drag-and-drop survey builder

### **Step 3: Survey Summary**
Unified review page showing:
- Exact questions selected
- Categories covered
- Estimated completion time
- Schedule preview

### **Step 4: Schedule & Settings**
Configure distribution:
- Send date (default: 15th of month at 10 AM)
- Channels (Email, Slack, Teams, WhatsApp, SMS)
- Reminders (Day 3, Day 7)
- Language & branding

### **Step 5: Launch**
Final confirmation and activation

## ✨ **Key Features**

### **🎯 Decision Clarity**
- **Step 1** makes users feel in control
- Clear visual distinction between paths
- Helpful subtexts explain each option
- Progress bar shows completion status

### **🚀 Guided Setup**
- Each path simplifies complexity
- No overwhelming single-page interface
- Logical flow from choice to completion
- Contextual help and guidance

### **💪 Confidence Building**
- **Summary page** shows exactly what they're sending
- **Preview functionality** for employee view
- **Real-time feedback** on survey quality
- **Clear next steps** at each stage

### **🔒 Trust & Retention**
- **Auto-Pilot** locks in recurring surveys
- **Template library** grows with usage
- **Consistent experience** across all paths
- **Professional presentation** builds confidence

## 🏗️ **Step-by-Step Breakdown**

### **Step 1: Choose Your Path**

#### **Auto-Pilot Option**
- **Icon**: Rotating arrows (🔄)
- **Color**: Blue to purple gradient
- **Features**:
  - 3, 6, or 12 months duration
  - Surveys rotate automatically
  - Consistent insights
- **Best for**: Ongoing measurement

#### **Template Option**
- **Icon**: Document (📄)
- **Color**: Green to teal gradient
- **Features**:
  - Time-based or scenario-based
  - 6 proven questions
  - Optimized for results
- **Best for**: Quick setup

#### **Build My Own Option**
- **Icon**: Settings (⚙️)
- **Color**: Orange to red gradient
- **Features**:
  - Drag-and-drop builder
  - Question bank access
  - Complete control
- **Best for**: Power users

### **Step 2: Configure Your Survey**

#### **Auto-Pilot Configuration**
Three plan options:
1. **Quarterly Plan** (3 months, 3 surveys)
   - Perfect for regular check-ins
   - Core metrics included
   - Rotating questions
   - Trend tracking

2. **Half-Year Plan** (6 months, 6 surveys)
   - Balanced measurement approach
   - Comprehensive coverage
   - Seasonal insights
   - Team growth tracking

3. **Annual Plan** (12 months, 12 surveys)
   - Complete year-round measurement
   - Full metric coverage
   - Long-term trends
   - Strategic insights

#### **Template Configuration**
Template gallery with:

**Time-Based Templates:**
- **Monthly Pulse**: Quick check-in on core health metrics
- **Quarterly Deep-Dive**: Richer insight into broader range of metrics

**Scenario-Based Templates:**
- **New Leader**: Assess team dynamics under new leadership
- **Post-Reorganization**: Check team morale after organizational changes

Each template shows:
- Question count (6)
- Categories covered
- Estimated time (55 sec)
- Description

#### **Custom Builder**
- **Question Bank**: 6 metric categories
  - Happiness & Satisfaction
  - eNPS & Engagement
  - Recognition
  - Communication
  - Career Growth
  - Value Alignment
- **Survey Canvas**: Drag-and-drop interface
- **Real-time Stats**: Question count and categories

### **Step 3: Survey Summary**

Unified review page showing:

#### **Survey Information**
- Title
- Question count
- Categories covered
- Estimated completion time

#### **Schedule Details**
- Start date
- Frequency
- Distribution channels
- Reminder settings

#### **Question Preview**
- Numbered list of all questions
- Category badges
- Required field indicators
- Question text

### **Step 4: Schedule & Settings**

#### **Schedule Configuration**
- **Start Date**: Date picker (default: 15th of month)
- **Frequency**: Dropdown (Once, Monthly, Quarterly, Annually)
- **Time**: Default 10 AM (best practice)

#### **Distribution Settings**
- **Channels**: Checkboxes for Email, Slack, Teams, WhatsApp, SMS
- **Reminders**: Checkboxes for Day 3, Day 7, Weekly
- **Preview Button**: Opens survey in new tab

### **Step 5: Launch**

#### **Final Confirmation**
- Success checkmark icon
- "Survey is Ready!" message
- Final summary of all settings

#### **Activation**
- "Activate Survey" button
- Success toast notification
- Navigation to dashboard

## 🎨 **UI/UX Highlights**

### **Progress Tracking**
- **Progress Bar**: Shows completion percentage
- **Step Counter**: "Step X of 5"
- **Visual Feedback**: Clear indication of current step

### **Card-Based Design**
- **Large Cards**: Easy to click and understand
- **Hover Effects**: Subtle animations
- **Selection States**: Clear visual feedback
- **Consistent Spacing**: Professional appearance

### **Responsive Layout**
- **Mobile-Friendly**: Works on all screen sizes
- **Grid System**: Adapts to different viewports
- **Touch-Friendly**: Large touch targets

### **Visual Hierarchy**
- **Clear Headings**: Step titles and descriptions
- **Consistent Typography**: Professional appearance
- **Color Coding**: Different colors for different paths
- **Icon Usage**: Meaningful icons throughout

## 🔧 **Technical Implementation**

### **Component Structure**
```
MultiStepSurveyBuilder/
├── ProgressBar/
├── Step1ChoosePath/
│   ├── AutoPilotCard
│   ├── TemplateCard
│   └── CustomCard
├── Step2Configure/
│   ├── AutoPilotConfig
│   ├── TemplateConfig
│   └── CustomBuilder
├── Step3Summary/
├── Step4Schedule/
└── Step5Launch/
```

### **State Management**
- **React Hooks**: useState for step management
- **Survey Data**: Centralized state object
- **Path-Specific Logic**: Conditional rendering based on selection

### **Navigation**
- **Back Buttons**: Allow users to go back
- **Continue Buttons**: Move to next step
- **Validation**: Ensure required data is provided

## 📊 **User Experience Benefits**

### **Reduced Cognitive Load**
- **One Decision at a Time**: Each step focuses on one aspect
- **Clear Visual Hierarchy**: Easy to understand what to do next
- **Progressive Disclosure**: Information revealed as needed

### **Increased Confidence**
- **Preview Functionality**: See exactly what employees will see
- **Summary Page**: Review everything before launching
- **Clear Feedback**: Know what's happening at each step

### **Faster Completion**
- **Templates**: Quick setup for common scenarios
- **Auto-Pilot**: Set once, forget about it
- **Guided Flow**: No confusion about next steps

### **Better Results**
- **Optimized Questions**: Templates are proven to work
- **Consistent Format**: Standardized for better analytics
- **Professional Presentation**: Builds trust with employees

## 🎯 **Success Metrics**

### **User Adoption**
- **Time to First Survey**: Should be under 5 minutes
- **Completion Rate**: Percentage who finish the flow
- **Path Selection**: Which options are most popular

### **Survey Quality**
- **Template Usage**: How often templates are used
- **Auto-Pilot Adoption**: Recurring survey setup
- **Custom Survey Length**: Optimal question count

### **Business Impact**
- **Response Rates**: Higher with better surveys
- **Employee Engagement**: Improved with regular feedback
- **Retention**: Auto-Pilot drives long-term usage

## 🚀 **Getting Started**

### **Access the Builder**
1. **Direct Demo**: Navigate to `/multi-step-survey-builder-demo`
2. **Through Create Survey**: Go to `/surveys/create` and click "Continue to Builder"
3. **Dashboard Link**: Add to navigation menu

### **Quick Start Guide**
1. **Choose Path**: Pick Auto-Pilot, Template, or Build My Own
2. **Configure**: Follow path-specific setup
3. **Review**: Check summary page
4. **Schedule**: Set distribution settings
5. **Launch**: Activate your survey

## 🔮 **Future Enhancements**

### **Phase 2 Features**
- **Advanced Templates**: More scenario-based options
- **Question Variations**: Multiple versions of each question
- **Branding Options**: Logo and color customization
- **Analytics Integration**: Real-time response tracking

### **Phase 3 Features**
- **AI Suggestions**: Smart question recommendations
- **Collaboration**: Team editing capabilities
- **Advanced Scheduling**: More flexible timing options
- **Integration APIs**: Connect with other HR tools

---

**The Multi-Step Survey Builder transforms survey creation from a complex task into a guided, confidence-building experience that gets HR managers from idea to launch in under 5 minutes.**
