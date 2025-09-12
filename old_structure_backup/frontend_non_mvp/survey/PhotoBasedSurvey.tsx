import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';

interface PhotoOption {
  number: number;
  photoName: string;
  photoPath: string;
  description: string;
  emotion: string;
}

interface PhotoBasedSurveyProps {
  question: string;
  onAnswer: (selectedNumber: number) => void;
  onBack?: () => void;
  onNext?: () => void;
  currentStep?: number;
  totalSteps?: number;
}

const PhotoBasedSurvey: React.FC<PhotoBasedSurveyProps> = ({
  question,
  onAnswer,
  onBack,
  onNext,
  currentStep = 1,
  totalSteps = 1
}) => {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [showSelected, setShowSelected] = useState(false);
  const { toast } = useToast();

  // Photo mapping based on your specifications
  const photoOptions: PhotoOption[] = [
    {
      number: 0,
      photoName: "111111",
      photoPath: "/survey-photos/111111.png", // Replace with your actual photo
      description: "Very Dissatisfied",
      emotion: "Extremely Sad"
    },
    {
      number: 1,
      photoName: "1010",
      photoPath: "/survey-photos/1010.png", // Replace with your actual photo
      description: "Dissatisfied",
      emotion: "Sad"
    },
    {
      number: 2,
      photoName: "999",
      photoPath: "/survey-photos/999.png", // Replace with your actual photo
      description: "Somewhat Dissatisfied",
      emotion: "Unhappy"
    },
    {
      number: 3,
      photoName: "888",
      photoPath: "/survey-photos/888.png", // Replace with your actual photo
      description: "Neutral",
      emotion: "Neutral"
    },
    {
      number: 4,
      photoName: "777",
      photoPath: "/survey-photos/777.png", // Replace with your actual photo
      description: "Somewhat Satisfied",
      emotion: "Slightly Happy"
    },
    {
      number: 5,
      photoName: "666",
      photoPath: "/survey-photos/666.png", // Replace with your actual photo
      description: "Satisfied",
      emotion: "Happy"
    },
    {
      number: 6,
      photoName: "555",
      photoPath: "/survey-photos/555.png", // Replace with your actual photo
      description: "Very Satisfied",
      emotion: "Very Happy"
    },
    {
      number: 7,
      photoName: "444",
      photoPath: "/survey-photos/444.png", // Replace with your actual photo
      description: "Extremely Satisfied",
      emotion: "Extremely Happy"
    },
    {
      number: 8,
      photoName: "333",
      photoPath: "/survey-photos/333.png", // Replace with your actual photo
      description: "Outstanding",
      emotion: "Ecstatic"
    },
    {
      number: 9,
      photoName: "222",
      photoPath: "/survey-photos/222.png", // Replace with your actual photo
      description: "Exceptional",
      emotion: "Overjoyed"
    },
    {
      number: 10,
      photoName: "111",
      photoPath: "/survey-photos/111.png", // Replace with your actual photo
      description: "Perfect",
      emotion: "Perfect"
    }
  ];

  const handlePhotoSelect = (number: number) => {
    setSelectedNumber(number);
    setShowSelected(true);
    
    toast({
      title: "Selection Made!",
      description: `You selected: ${photoOptions.find(p => p.number === number)?.description}`,
    });
  };

  const handleConfirm = () => {
    if (selectedNumber !== null) {
      onAnswer(selectedNumber);
      setShowSelected(false);
      setSelectedNumber(null);
    }
  };

  const handleBack = () => {
    setSelectedNumber(null);
    setShowSelected(false);
    onBack?.();
  };

  const getSelectedPhoto = () => {
    return photoOptions.find(p => p.number === selectedNumber);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            {onBack && (
              <Button
                variant="ghost"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            <div className="flex-1" />
            {totalSteps > 1 && (
              <Badge variant="secondary" className="ml-auto">
                Step {currentStep} of {totalSteps}
              </Badge>
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {question}
          </h1>
          <p className="text-gray-600 text-lg">
            Select the number that best represents your response
          </p>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
          {photoOptions.map((option) => (
            <Card
              key={option.number}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                selectedNumber === option.number
                  ? 'ring-4 ring-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handlePhotoSelect(option.number)}
            >
              <CardContent className="p-4 text-center">
                {/* Actual Photo */}
                <div className="w-16 h-16 mx-auto mb-3 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-colors">
                  <img
                    src={`/survey-photos/${option.photoName}.png`}
                    alt={`Photo ${option.number} - ${option.emotion}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to emoji if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  {/* Fallback emoji */}
                  <div className={`w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-2xl ${option.photoPath ? 'hidden' : ''}`}>
                    {option.emotion === "Extremely Sad" && "😢"}
                    {option.emotion === "Sad" && "😞"}
                    {option.emotion === "Unhappy" && "😕"}
                    {option.emotion === "Neutral" && "😐"}
                    {option.emotion === "Slightly Happy" && "🙂"}
                    {option.emotion === "Happy" && "😊"}
                    {option.emotion === "Very Happy" && "😄"}
                    {option.emotion === "Extremely Happy" && "😁"}
                    {option.emotion === "Ecstatic" && "🤩"}
                    {option.emotion === "Overjoyed" && "🥳"}
                    {option.emotion === "Perfect" && "😍"}
                  </div>
                </div>
                
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {option.number}
                </div>
                
                <div className="text-xs text-gray-600 font-medium">
                  {option.description}
                </div>
                
                {selectedNumber === option.number && (
                  <div className="mt-2">
                    <Check className="w-5 h-5 text-blue-600 mx-auto" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Photo Display */}
        {showSelected && selectedNumber !== null && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-center text-blue-900">
                Your Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-blue-200">
                    <img
                      src={getSelectedPhoto()?.photoPath}
                      alt={`Selected Photo ${selectedNumber} - ${getSelectedPhoto()?.emotion}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to emoji if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    {/* Fallback emoji */}
                    <div className={`w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-4xl ${getSelectedPhoto()?.photoPath ? 'hidden' : ''}`}>
                      {getSelectedPhoto()?.emotion === "Extremely Sad" && "😢"}
                      {getSelectedPhoto()?.emotion === "Sad" && "😞"}
                      {getSelectedPhoto()?.emotion === "Unhappy" && "😕"}
                      {getSelectedPhoto()?.emotion === "Neutral" && "😐"}
                      {getSelectedPhoto()?.emotion === "Slightly Happy" && "🙂"}
                      {getSelectedPhoto()?.emotion === "Happy" && "😊"}
                      {getSelectedPhoto()?.emotion === "Very Happy" && "😄"}
                      {getSelectedPhoto()?.emotion === "Extremely Happy" && "😁"}
                      {getSelectedPhoto()?.emotion === "Ecstatic" && "🤩"}
                      {getSelectedPhoto()?.emotion === "Overjoyed" && "🥳"}
                      {getSelectedPhoto()?.emotion === "Perfect" && "😍"}
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {selectedNumber}
                  </div>
                  <div className="text-lg font-semibold text-gray-700 mb-1">
                    {getSelectedPhoto()?.description}
                  </div>
                  <div className="text-sm text-gray-600">
                    {getSelectedPhoto()?.emotion}
                  </div>
                </div>
                
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Photo: {getSelectedPhoto()?.photoName}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    This represents your level of satisfaction or agreement with the question.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => setShowSelected(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Change Selection
                    </Button>
                    <Button
                      onClick={handleConfirm}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Confirm Selection
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              How to Use This Survey
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">📱 Mobile Friendly</h4>
                <p>Tap any photo to select your response. The interface is optimized for touch devices.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">🎯 Easy Selection</h4>
                <p>Each number corresponds to a specific emotion and satisfaction level. Choose what feels right!</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">🔄 Change Your Mind</h4>
                <p>You can change your selection before confirming. Just tap a different photo.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">✅ Confirm & Continue</h4>
                <p>Once you're happy with your choice, confirm to proceed to the next question.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PhotoBasedSurvey;
