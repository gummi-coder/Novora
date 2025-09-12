import { a as reactExports, u as useToast, j as jsxRuntimeExports, B as Button, b2 as ArrowLeft, ai as Badge, C as Card, b as CardContent, z as Check, d as CardHeader, e as CardTitle, A as ArrowRight, a0 as useNavigate, aG as CheckCircle } from "./builder-BipuaEoP.js";
const PhotoBasedSurvey = ({
  question,
  onAnswer,
  onBack,
  onNext,
  currentStep = 1,
  totalSteps = 1
}) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q;
  const [selectedNumber, setSelectedNumber] = reactExports.useState(null);
  const [showSelected, setShowSelected] = reactExports.useState(false);
  const { toast } = useToast();
  const photoOptions = [
    {
      number: 0,
      photoName: "111111",
      photoPath: "/survey-photos/111111.png",
      // Replace with your actual photo
      description: "Very Dissatisfied",
      emotion: "Extremely Sad"
    },
    {
      number: 1,
      photoName: "1010",
      photoPath: "/survey-photos/1010.png",
      // Replace with your actual photo
      description: "Dissatisfied",
      emotion: "Sad"
    },
    {
      number: 2,
      photoName: "999",
      photoPath: "/survey-photos/999.png",
      // Replace with your actual photo
      description: "Somewhat Dissatisfied",
      emotion: "Unhappy"
    },
    {
      number: 3,
      photoName: "888",
      photoPath: "/survey-photos/888.png",
      // Replace with your actual photo
      description: "Neutral",
      emotion: "Neutral"
    },
    {
      number: 4,
      photoName: "777",
      photoPath: "/survey-photos/777.png",
      // Replace with your actual photo
      description: "Somewhat Satisfied",
      emotion: "Slightly Happy"
    },
    {
      number: 5,
      photoName: "666",
      photoPath: "/survey-photos/666.png",
      // Replace with your actual photo
      description: "Satisfied",
      emotion: "Happy"
    },
    {
      number: 6,
      photoName: "555",
      photoPath: "/survey-photos/555.png",
      // Replace with your actual photo
      description: "Very Satisfied",
      emotion: "Very Happy"
    },
    {
      number: 7,
      photoName: "444",
      photoPath: "/survey-photos/444.png",
      // Replace with your actual photo
      description: "Extremely Satisfied",
      emotion: "Extremely Happy"
    },
    {
      number: 8,
      photoName: "333",
      photoPath: "/survey-photos/333.png",
      // Replace with your actual photo
      description: "Outstanding",
      emotion: "Ecstatic"
    },
    {
      number: 9,
      photoName: "222",
      photoPath: "/survey-photos/222.png",
      // Replace with your actual photo
      description: "Exceptional",
      emotion: "Overjoyed"
    },
    {
      number: 10,
      photoName: "111",
      photoPath: "/survey-photos/111.png",
      // Replace with your actual photo
      description: "Perfect",
      emotion: "Perfect"
    }
  ];
  const handlePhotoSelect = (number) => {
    var _a2;
    setSelectedNumber(number);
    setShowSelected(true);
    toast({
      title: "Selection Made!",
      description: `You selected: ${(_a2 = photoOptions.find((p) => p.number === number)) == null ? void 0 : _a2.description}`
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
    onBack == null ? void 0 : onBack();
  };
  const getSelectedPhoto = () => {
    return photoOptions.find((p) => p.number === selectedNumber);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        onBack && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "ghost",
            onClick: handleBack,
            className: "flex items-center gap-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4" }),
              "Back"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
        totalSteps > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "ml-auto", children: [
          "Step ",
          currentStep,
          " of ",
          totalSteps
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-4", children: question }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 text-lg", children: "Select the number that best represents your response" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8", children: photoOptions.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Card,
      {
        className: `cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${selectedNumber === option.number ? "ring-4 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"}`,
        onClick: () => handlePhotoSelect(option.number),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-16 h-16 mx-auto mb-3 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: `/survey-photos/${option.photoName}.png`,
                alt: `Photo ${option.number} - ${option.emotion}`,
                className: "w-full h-full object-cover",
                onError: (e) => {
                  var _a2;
                  const target = e.target;
                  target.style.display = "none";
                  (_a2 = target.nextElementSibling) == null ? void 0 : _a2.classList.remove("hidden");
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-2xl ${option.photoPath ? "hidden" : ""}`, children: [
              option.emotion === "Extremely Sad" && "😢",
              option.emotion === "Sad" && "😞",
              option.emotion === "Unhappy" && "😕",
              option.emotion === "Neutral" && "😐",
              option.emotion === "Slightly Happy" && "🙂",
              option.emotion === "Happy" && "😊",
              option.emotion === "Very Happy" && "😄",
              option.emotion === "Extremely Happy" && "😁",
              option.emotion === "Ecstatic" && "🤩",
              option.emotion === "Overjoyed" && "🥳",
              option.emotion === "Perfect" && "😍"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-gray-900 mb-1", children: option.number }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-600 font-medium", children: option.description }),
          selectedNumber === option.number && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-5 h-5 text-blue-600 mx-auto" }) })
        ] })
      },
      option.number
    )) }),
    showSelected && selectedNumber !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-center text-blue-900", children: "Your Selection" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row items-center justify-center gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-blue-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: (_a = getSelectedPhoto()) == null ? void 0 : _a.photoPath,
                alt: `Selected Photo ${selectedNumber} - ${(_b = getSelectedPhoto()) == null ? void 0 : _b.emotion}`,
                className: "w-full h-full object-cover",
                onError: (e) => {
                  var _a2;
                  const target = e.target;
                  target.style.display = "none";
                  (_a2 = target.nextElementSibling) == null ? void 0 : _a2.classList.remove("hidden");
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-4xl ${((_c = getSelectedPhoto()) == null ? void 0 : _c.photoPath) ? "hidden" : ""}`, children: [
              ((_d = getSelectedPhoto()) == null ? void 0 : _d.emotion) === "Extremely Sad" && "😢",
              ((_e = getSelectedPhoto()) == null ? void 0 : _e.emotion) === "Sad" && "😞",
              ((_f = getSelectedPhoto()) == null ? void 0 : _f.emotion) === "Unhappy" && "😕",
              ((_g = getSelectedPhoto()) == null ? void 0 : _g.emotion) === "Neutral" && "😐",
              ((_h = getSelectedPhoto()) == null ? void 0 : _h.emotion) === "Slightly Happy" && "🙂",
              ((_i = getSelectedPhoto()) == null ? void 0 : _i.emotion) === "Happy" && "😊",
              ((_j = getSelectedPhoto()) == null ? void 0 : _j.emotion) === "Very Happy" && "😄",
              ((_k = getSelectedPhoto()) == null ? void 0 : _k.emotion) === "Extremely Happy" && "😁",
              ((_l = getSelectedPhoto()) == null ? void 0 : _l.emotion) === "Ecstatic" && "🤩",
              ((_m = getSelectedPhoto()) == null ? void 0 : _m.emotion) === "Overjoyed" && "🥳",
              ((_n = getSelectedPhoto()) == null ? void 0 : _n.emotion) === "Perfect" && "😍"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-bold text-gray-900 mb-2", children: selectedNumber }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-semibold text-gray-700 mb-1", children: (_o = getSelectedPhoto()) == null ? void 0 : _o.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-600", children: (_p = getSelectedPhoto()) == null ? void 0 : _p.emotion })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center md:text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: [
            "Photo: ",
            (_q = getSelectedPhoto()) == null ? void 0 : _q.photoName
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-4", children: "This represents your level of satisfaction or agreement with the question." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: () => setShowSelected(false),
                variant: "outline",
                className: "flex-1",
                children: "Change Selection"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                onClick: handleConfirm,
                className: "flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                children: [
                  "Confirm Selection",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-4 h-4 ml-2" })
                ]
              }
            )
          ] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "bg-white/80 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-3", children: "How to Use This Survey" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-4 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "📱 Mobile Friendly" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Tap any photo to select your response. The interface is optimized for touch devices." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "🎯 Easy Selection" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Each number corresponds to a specific emotion and satisfaction level. Choose what feels right!" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "🔄 Change Your Mind" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "You can change your selection before confirming. Just tap a different photo." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "✅ Confirm & Continue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Once you're happy with your choice, confirm to proceed to the next question." })
        ] })
      ] })
    ] }) })
  ] }) });
};
const PhotoSurveyDemo = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = reactExports.useState(1);
  const [answers, setAnswers] = reactExports.useState([]);
  const [isCompleted, setIsCompleted] = reactExports.useState(false);
  const questions = [
    {
      id: 1,
      question: "How satisfied are you with your current work environment?",
      category: "Work Environment"
    },
    {
      id: 2,
      question: "How would you rate your relationship with your manager?",
      category: "Management"
    },
    {
      id: 3,
      question: "How happy are you with your work-life balance?",
      category: "Work-Life Balance"
    },
    {
      id: 4,
      question: "How satisfied are you with your career growth opportunities?",
      category: "Career Development"
    },
    {
      id: 5,
      question: "How would you rate the overall company culture?",
      category: "Company Culture"
    }
  ];
  const handleAnswer = (selectedNumber) => {
    const currentQuestion = questions[currentStep - 1];
    const photoMapping = {
      0: { photoName: "111111", emotion: "Extremely Sad" },
      1: { photoName: "1010", emotion: "Sad" },
      2: { photoName: "999", emotion: "Unhappy" },
      3: { photoName: "888", emotion: "Neutral" },
      4: { photoName: "777", emotion: "Slightly Happy" },
      5: { photoName: "666", emotion: "Happy" },
      6: { photoName: "555", emotion: "Very Happy" },
      7: { photoName: "444", emotion: "Extremely Happy" },
      8: { photoName: "333", emotion: "Ecstatic" },
      9: { photoName: "222", emotion: "Overjoyed" },
      10: { photoName: "111", emotion: "Perfect" }
    };
    const answer = {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      selectedNumber,
      photoName: photoMapping[selectedNumber].photoName,
      emotion: photoMapping[selectedNumber].emotion
    };
    setAnswers((prev) => [...prev, answer]);
    if (currentStep < questions.length) {
      setCurrentStep((prev) => prev + 1);
      toast({
        title: "Answer Saved!",
        description: `Moving to question ${currentStep + 1} of ${questions.length}`
      });
    } else {
      setIsCompleted(true);
      toast({
        title: "Survey Completed!",
        description: "Thank you for your responses!"
      });
    }
  };
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setAnswers((prev) => prev.slice(0, -1));
    } else {
      navigate("/dashboard");
    }
  };
  const handleRestart = () => {
    setCurrentStep(1);
    setAnswers([]);
    setIsCompleted(false);
  };
  const getAverageScore = () => {
    if (answers.length === 0) return 0;
    const total = answers.reduce((sum, answer) => sum + answer.selectedNumber, 0);
    return (total / answers.length).toFixed(1);
  };
  const getOverallEmotion = (score) => {
    if (score >= 8) return "😍 Perfect";
    if (score >= 6) return "😄 Very Happy";
    if (score >= 4) return "😊 Happy";
    if (score >= 2) return "😐 Neutral";
    return "😢 Unhappy";
  };
  if (isCompleted) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "w-12 h-12 text-green-600" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-4", children: "Survey Completed!" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 text-lg mb-8", children: "Thank you for your responses. Here's a summary of your answers." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-center text-green-900", children: "Survey Summary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-3 gap-6 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-bold text-gray-900 mb-2", children: answers.length }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-600", children: "Questions Answered" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-bold text-blue-600 mb-2", children: getAverageScore() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-600", children: "Average Score" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-bold text-green-600 mb-2", children: getOverallEmotion(parseFloat(getAverageScore())) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-600", children: "Overall Sentiment" })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 mb-8", children: answers.map((answer, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "hover:shadow-md transition-shadow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row items-start md:items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "mb-2", children: [
            "Question ",
            index + 1
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl", children: [
            answer.emotion === "Extremely Sad" && "😢",
            answer.emotion === "Sad" && "😞",
            answer.emotion === "Unhappy" && "😕",
            answer.emotion === "Neutral" && "😐",
            answer.emotion === "Slightly Happy" && "🙂",
            answer.emotion === "Happy" && "😊",
            answer.emotion === "Very Happy" && "😄",
            answer.emotion === "Extremely Happy" && "😁",
            answer.emotion === "Ecstatic" && "🤩",
            answer.emotion === "Overjoyed" && "🥳",
            answer.emotion === "Perfect" && "😍"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: answer.question }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-sm text-gray-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Score: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: answer.selectedNumber })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Photo: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: answer.photoName })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Emotion: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: answer.emotion })
            ] })
          ] })
        ] })
      ] }) }) }, answer.questionId)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: handleRestart,
            variant: "outline",
            className: "flex items-center gap-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4" }),
              "Take Survey Again"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => navigate("/dashboard"),
            className: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
            children: "Back to Dashboard"
          }
        )
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    PhotoBasedSurvey,
    {
      question: questions[currentStep - 1].question,
      onAnswer: handleAnswer,
      onBack: handleBack,
      currentStep,
      totalSteps: questions.length
    }
  );
};
export {
  PhotoSurveyDemo as default
};
//# sourceMappingURL=PhotoSurveyDemo-DiOLSIe0.js.map
