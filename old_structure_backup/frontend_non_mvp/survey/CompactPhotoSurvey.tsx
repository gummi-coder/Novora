import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Check } from 'lucide-react';

interface PhotoOption {
  number: number;
  photoName: string;
  photoPath: string;
  description: string;
  emotion: string;
}

interface CompactPhotoSurveyProps {
  question: string;
  onAnswer: (selectedNumber: number) => void;
  required?: boolean;
}

const CompactPhotoSurvey: React.FC<CompactPhotoSurveyProps> = ({
  question,
  onAnswer,
  required = true
}) => {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [showSelected, setShowSelected] = useState(false);
  const { toast } = useToast();

  // Photo mapping based on your specifications
  const photoOptions: PhotoOption[] = [
    {
      number: 0,
      photoName: "111111",
      photoPath: "/survey-photos/111111.png",
      description: "Very Dissatisfied",
      emotion: "Extremely Sad"
    },
    {
      number: 1,
      photoName: "1010",
      photoPath: "/survey-photos/1010.png",
      description: "Dissatisfied",
      emotion: "Sad"
    },
    {
      number: 2,
      photoName: "999",
      photoPath: "/survey-photos/999.png",
      description: "Somewhat Dissatisfied",
      emotion: "Unhappy"
    },
    {
      number: 3,
      photoName: "888",
      photoPath: "/survey-photos/888.png",
      description: "Neutral",
      emotion: "Neutral"
    },
    {
      number: 4,
      photoName: "777",
      photoPath: "/survey-photos/777.png",
      description: "Somewhat Satisfied",
      emotion: "Slightly Happy"
    },
    {
      number: 5,
      photoName: "666",
      photoPath: "/survey-photos/666.png",
      description: "Satisfied",
      emotion: "Happy"
    },
    {
      number: 6,
      photoName: "555",
      photoPath: "/survey-photos/555.png",
      description: "Very Satisfied",
      emotion: "Very Happy"
    },
    {
      number: 7,
      photoName: "444",
      photoPath: "/survey-photos/444.png",
      description: "Extremely Satisfied",
      emotion: "Extremely Happy"
    },
    {
      number: 8,
      photoName: "333",
      photoPath: "/survey-photos/333.png",
      description: "Outstanding",
      emotion: "Ecstatic"
    },
    {
      number: 9,
      photoName: "222",
      photoPath: "/survey-photos/222.png",
      description: "Exceptional",
      emotion: "Overjoyed"
    },
    {
      number: 10,
      photoName: "111",
      photoPath: "/survey-photos/111.png",
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

  const getSelectedPhoto = () => {
    return photoOptions.find(p => p.number === selectedNumber);
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        {/* Question Header */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            {question}
            {required && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </h2>
          <p className="text-sm text-gray-500">
            Select the photo that best represents your response
          </p>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          {photoOptions.map((option) => (
            <div
              key={option.number}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 rounded-lg border-2 ${
                selectedNumber === option.number
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handlePhotoSelect(option.number)}
            >
              <div className="p-3 text-center">
                {/* Photo */}
                <div className="w-12 h-12 mx-auto mb-2 rounded-lg overflow-hidden border border-gray-200">
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
                  <div className={`w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-lg ${option.photoPath ? 'hidden' : ''}`}>
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
                
                <div className="text-lg font-bold text-gray-900 mb-1">
                  {option.number}
                </div>
                
                <div className="text-xs text-gray-600">
                  {option.description}
                </div>
                
                {selectedNumber === option.number && (
                  <div className="mt-1">
                    <Check className="w-4 h-4 text-blue-600 mx-auto" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Photo Display */}
        {showSelected && selectedNumber !== null && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-blue-200">
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden border-2 border-blue-200">
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
                  <div className={`w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-2xl ${getSelectedPhoto()?.photoPath ? 'hidden' : ''}`}>
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
                <div className="text-xl font-bold text-gray-900 mb-1">
                  {selectedNumber}
                </div>
                <div className="text-sm font-semibold text-gray-700">
                  {getSelectedPhoto()?.description}
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Photo: {getSelectedPhoto()?.photoName}
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  This represents your level of satisfaction or agreement with the question.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowSelected(false)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Change
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Tap any photo to select your response. Each number corresponds to a specific satisfaction level.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactPhotoSurvey;
