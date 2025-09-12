import { u as useToast, a0 as useNavigate, a as reactExports, j as jsxRuntimeExports, B as Button, b2 as ArrowLeft, aj as Plus, aC as Search, I as Input, b3 as ArrowUpNarrowWide, b4 as ArrowDownWideNarrow, C as Card, b as CardContent, F as FileText, d as CardHeader, b5 as MoreHorizontal, i as Eye, aR as PenSquare, ae as BarChart3, aT as Play, b6 as Pause, aS as Trash2, e as CardTitle, ai as Badge, b7 as StopCircle, G as Clock } from "./builder-BipuaEoP.js";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, e as DropdownMenuItem, d as DropdownMenuSeparator } from "./dropdown-menu-DtnPhN9D.js";
import "./index-CkLv4TXk.js";
const SurveysList = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [surveys, setSurveys] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [filterStatus, setFilterStatus] = reactExports.useState("all");
  const [sortBy, setSortBy] = reactExports.useState("created_at");
  const [sortOrder, setSortOrder] = reactExports.useState("desc");
  reactExports.useEffect(() => {
    fetchSurveys();
  }, []);
  const fetchSurveys = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth/signin");
        return;
      }
      const response = await fetch("http://localhost:8000/api/v1/surveys/", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error("Failed to fetch surveys");
      }
      const data = await response.json();
      setSurveys(data);
    } catch (error) {
      console.error("Error fetching surveys:", error);
      toast({
        title: "Error",
        description: "Failed to load surveys",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteSurvey = async (surveyId) => {
    if (!confirm("Are you sure you want to delete this survey? This action cannot be undone.")) {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/api/v1/surveys/${surveyId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error("Failed to delete survey");
      }
      toast({
        title: "Survey deleted",
        description: "The survey has been successfully deleted."
      });
      fetchSurveys();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete survey",
        variant: "destructive"
      });
    }
  };
  const handleActivateSurvey = async (surveyId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/api/v1/surveys/${surveyId}/activate`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error("Failed to activate survey");
      }
      toast({
        title: "Survey activated",
        description: "The survey is now live and accepting responses."
      });
      fetchSurveys();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate survey",
        variant: "destructive"
      });
    }
  };
  const handleCloseSurvey = async (surveyId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/api/v1/surveys/${surveyId}/close`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error("Failed to close survey");
      }
      toast({
        title: "Survey closed",
        description: "The survey is now closed and no longer accepting responses."
      });
      fetchSurveys();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to close survey",
        variant: "destructive"
      });
    }
  };
  const getStatusBadge = (status) => {
    switch (status) {
      case "draft":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Draft" });
      case "active":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "default", className: "bg-green-100 text-green-800", children: "Active" });
      case "closed":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", children: "Closed" });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: status });
    }
  };
  const getStatusIcon = (status) => {
    switch (status) {
      case "draft":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4" });
      case "active":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4" });
      case "closed":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(StopCircle, { className: "h-4 w-4" });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" });
    }
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };
  const filteredSurveys = surveys.filter((survey) => {
    const matchesSearch = survey.title.toLowerCase().includes(searchQuery.toLowerCase()) || survey.description && survey.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || survey.status === filterStatus;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    let aValue, bValue;
    switch (sortBy) {
      case "title":
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case "status":
        aValue = a.status;
        bValue = b.status;
        break;
      case "response_count":
        aValue = a.response_count;
        bValue = b.response_count;
        break;
      case "created_at":
      default:
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
        break;
    }
    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gray-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "bg-white shadow-sm border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center h-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => navigate("/dashboard"),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }),
              "Back to Dashboard"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold text-gray-900", children: "My Surveys" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => navigate("/surveys/create"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-2" }),
        "Create Survey"
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Search surveys...",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              className: "pl-10"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: filterStatus,
              onChange: (e) => setFilterStatus(e.target.value),
              className: "px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All Status" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "draft", children: "Draft" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "active", children: "Active" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "closed", children: "Closed" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: sortBy,
              onChange: (e) => setSortBy(e.target.value),
              className: "px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "created_at", children: "Created Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "title", children: "Title" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "status", children: "Status" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "response_count", children: "Responses" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => setSortOrder(sortOrder === "asc" ? "desc" : "asc"),
              children: sortOrder === "asc" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpNarrowWide, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownWideNarrow, { className: "h-4 w-4" })
            }
          )
        ] })
      ] }) }),
      filteredSurveys.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "text-center py-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-12 w-12 mx-auto mb-4 text-gray-300" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: surveys.length === 0 ? "No surveys yet" : "No surveys match your filters" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 mb-6", children: surveys.length === 0 ? "Create your first survey to get started" : "Try adjusting your search or filter criteria" }),
        surveys.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => navigate("/surveys/create"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-2" }),
          "Create Your First Survey"
        ] })
      ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: filteredSurveys.map((survey) => {
        var _a;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "hover:shadow-md transition-shadow", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
                getStatusIcon(survey.status),
                getStatusBadge(survey.status)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MoreHorizontal, { className: "h-4 w-4" }) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => navigate(`/surveys/${survey.id}`), children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4 mr-2" }),
                    "View"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => navigate(`/surveys/${survey.id}/edit`), children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(PenSquare, { className: "h-4 w-4 mr-2" }),
                    "Edit"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => navigate(`/surveys/${survey.id}/results`), children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(BarChart3, { className: "h-4 w-4 mr-2" }),
                    "Results"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
                  survey.status === "draft" && /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => handleActivateSurvey(survey.id), children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4 mr-2" }),
                    "Activate"
                  ] }),
                  survey.status === "active" && /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => handleCloseSurvey(survey.id), children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "h-4 w-4 mr-2" }),
                    "Close"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    DropdownMenuItem,
                    {
                      onClick: () => handleDeleteSurvey(survey.id),
                      className: "text-red-600",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 mr-2" }),
                        "Delete"
                      ]
                    }
                  )
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg", children: survey.title }),
            survey.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 line-clamp-2", children: survey.description })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Questions" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: ((_a = survey.questions) == null ? void 0 : _a.length) || 0 })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Responses" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: survey.response_count })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Created" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: formatDate(survey.created_at) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                  className: "flex-1",
                  onClick: () => navigate(`/surveys/${survey.id}`),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4 mr-2" }),
                    "View"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                  className: "flex-1",
                  onClick: () => navigate(`/surveys/${survey.id}/results`),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(BarChart3, { className: "h-4 w-4 mr-2" }),
                    "Results"
                  ]
                }
              )
            ] })
          ] })
        ] }, survey.id);
      }) })
    ] })
  ] });
};
export {
  SurveysList as default
};
//# sourceMappingURL=SurveysList-B4dzN_YG.js.map
