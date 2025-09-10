import { a0 as useNavigate, u as useToast, a as reactExports, j as jsxRuntimeExports, b1 as MultiStepSurveyBuilder } from "./builder-BipuaEoP.js";
import { u as useAuth } from "./useAuth-DVm6gpcM.js";
const CreateSurvey = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  reactExports.useEffect(() => {
    if (user && user.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "Only administrators can create surveys.",
        variant: "destructive"
      });
      navigate("/dashboard");
    }
  }, [user, navigate, toast]);
  if (!user || user.role !== "admin") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-gray-600", children: "Checking permissions..." })
    ] }) });
  }
  const handleComplete = (data) => {
    console.log("Survey completed:", data);
    toast({
      title: "Survey Created Successfully!",
      description: "Your survey has been launched and is now active."
    });
    navigate("/dashboard");
  };
  const handleBack = () => {
    navigate("/dashboard");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    MultiStepSurveyBuilder,
    {
      onComplete: handleComplete,
      onBack: handleBack
    }
  );
};
export {
  CreateSurvey as default
};
//# sourceMappingURL=CreateSurvey-s7f5iNz7.js.map
