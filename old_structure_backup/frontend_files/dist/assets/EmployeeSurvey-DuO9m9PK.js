import { b0 as useParams, a as reactExports, j as jsxRuntimeExports } from "./builder-BipuaEoP.js";
const EmployeeSurvey = () => {
  var _a;
  const { token } = useParams();
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  const [surveyData, setSurveyData] = reactExports.useState(null);
  const [answers, setAnswers] = reactExports.useState({});
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [submitted, setSubmitted] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (token) {
      fetchSurvey(token);
    }
  }, [token]);
  const fetchSurvey = async (surveyToken) => {
    try {
      const response = await fetch(`http://localhost:8000/s/r/${surveyToken}`);
      if (!response.ok) {
        throw new Error("Survey not found or expired");
      }
      const data = await response.json();
      setSurveyData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load survey");
    } finally {
      setLoading(false);
    }
  };
  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer
    }));
  };
  const handleSubmit = async () => {
    if (!token || !surveyData) return;
    setSubmitting(true);
    try {
      const response = await fetch(`http://localhost:8000/s/r/${token}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ answers })
      });
      if (!response.ok) {
        throw new Error("Failed to submit survey");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit survey");
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-gray-600", children: "Loading survey..." })
    ] }) });
  }
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-2", children: "Survey Not Available" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: error })
    ] }) });
  }
  if (!surveyData) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "No survey data available" }) }) });
  }
  if (surveyData.status === "completed" || submitted) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center max-w-md mx-auto px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl", children: "✅" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-bold text-gray-900 mb-4", children: "Thank You!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-6 text-lg", children: submitted ? "Your survey response has been submitted successfully!" : "This survey has already been completed. Thank you for your response!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-sm border border-green-100 p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center space-x-2 text-green-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl", children: "🛡️" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Your response is anonymous and secure" })
      ] }) })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto px-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: "📊" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-2", children: surveyData.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 max-w-2xl mx-auto", children: surveyData.description })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-sm border border-blue-100 p-6 mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: "🛡️" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Anonymous & Secure" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 text-sm", children: surveyData.message })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-8", children: (_a = surveyData.questions) == null ? void 0 : _a.map((question, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-100 p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: question.text }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto" })
      ] }),
      question.type === "rating" && question.options && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center items-center space-x-4 flex-wrap gap-4", children: question.options.map((option, optionIndex) => {
        const emojiMap = {
          "Very dissatisfied": "😞",
          "Dissatisfied": "😕",
          "Neutral": "😐",
          "Satisfied": "🙂",
          "Very satisfied": "😊",
          "Very unlikely": "😞",
          "Unlikely": "😕",
          "Likely": "🙂",
          "Very likely": "😊"
        };
        const emoji = emojiMap[option] || "😐";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "label",
          {
            className: "flex flex-col items-center cursor-pointer group p-4 rounded-xl border-2 border-transparent hover:border-blue-200 hover:bg-blue-50 transition-all duration-200",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "radio",
                  name: `question-${question.id}`,
                  value: option,
                  className: "sr-only",
                  onChange: (e) => handleAnswerChange(question.id, e.target.value)
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-6xl mb-3 group-hover:scale-110 transition-transform duration-200", children: emoji }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700 text-center max-w-24", children: option })
            ]
          },
          optionIndex
        );
      }) }),
      question.type === "text" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-2xl mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          placeholder: "Share your thoughts... (Optional)",
          className: "w-full min-h-[120px] border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors duration-200 resize-none",
          onChange: (e) => handleAnswerChange(question.id, e.target.value)
        }
      ) })
    ] }, question.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-12 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: handleSubmit,
        disabled: submitting,
        className: "bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
        children: submitting ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-spin inline-block mr-2", children: "⏳" }),
          "Submitting..."
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: "Submit Survey 🚀" })
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 text-sm", children: "Powered by Novora • Your responses are completely anonymous" }) })
  ] }) });
};
export {
  EmployeeSurvey as default
};
//# sourceMappingURL=EmployeeSurvey-DuO9m9PK.js.map
